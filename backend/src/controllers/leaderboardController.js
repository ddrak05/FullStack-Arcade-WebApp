import pool from '../db/index.js';

// Top 10 players by XP
export async function getTopUsers (req, res) {
    const user_id = req.user.id;
    try{
        const [rows] = await pool.query(`
            SELECT u.id, u.username, u.xp,
                COUNT(us.id) AS games_played
            FROM users u
                LEFT JOIN user_scores us ON us.user_id = u.id
            GROUP BY u.id, u.username, u.xp
            ORDER BY u.xp DESC, u.id ASC
            LIMIT 15
        `);

        const userInRows = rows.some(r => r.id === user_id);
        let currentUser = null;
        if (!userInRows) {
            // Rank logic: more XP, or equal XP with lower ID
            const [[userRows]] = await pool.query(`
                SELECT u.id, u.username, u.xp,
                    COUNT(us.id) AS games_played,
                    (SELECT COUNT(*) FROM users u2 
                     WHERE u2.xp > u.xp 
                     OR (u2.xp = u.xp AND u2.id < u.id)
                    ) + 1 AS player_rank
                FROM users u
                    LEFT JOIN user_scores us ON us.user_id = u.id
                WHERE u.id = ?
                GROUP BY u.id, u.username, u.xp    
            `, [user_id, user_id]);

            currentUser = userRows;
        }

        // Get total users
        const [[{total}]] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM users
        `)

        res.status(200).json({rows, currentUser, total});
    } catch (err) {
        console.log(err);
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

// Get top user XP by period
export async function getXpByPeriod(req, res) {
    const user_id = req.user.id;
    const {period} = req.query;

    const periodFilter =
        period === 'daily' ? 'AND DATE(xp.received_at) = CURDATE()' :
            period === 'weekly' ? 'AND xp.received_at >= NOW() - INTERVAL 7 DAY' :
                period === 'monthly' ? 'AND xp.received_at >= NOW() - INTERVAL 30 DAY' : '';

    try{
        const [rows] = await pool.query(`
            SELECT u.id, u.username, u.xp,
                COUNT(CASE WHEN xp.source = 'game' THEN 1 END) AS games_played,
                COALESCE(SUM(xp.amount), 0) AS xp_earned
            FROM users u
                LEFT JOIN user_xp xp ON u.id = xp.user_id 
                    ${periodFilter}
            GROUP BY u.id, u.username, u.xp
            ORDER BY xp_earned DESC, games_played DESC, u.xp DESC  
            LIMIT 15 
        `);

        const userInRows = rows.some(r => r.id  === user_id);
        let currentUser = null;
        if(!userInRows) {
            const [userRows] = await pool.query(`
                SELECT u.id, u.username, u.xp,
                    COUNT(CASE WHEN xp.source = 'game' THEN 1 END) AS games_played
                    COALESCE(SUM(us.xp_earned), 0) AS xp_earned,
                FROM users u
                    LEFT JOIN user_xp xp ON us.user_id = xp.id ${periodFilter}
                WHERE u.id = ?
                GROUP BY u.id, u.username, u.xp
            `, [user_id]);

            currentUser = userRows[0];

            const [[rankResult]] = await pool.query(`
                SELECT COUNT(*) + 1 AS player_rank 
                FROM (
                    SELECT u.id, COALESCE(SUM(us.xp_earned), 0) as total_earned
                    FROM users u
                    LEFT JOIN user_xp xp ON xp.user_id = u.id ${periodFilter}
                    GROUP BY u.id
                    HAVING total_earned > ? 
                       OR (total_earned = ? AND u.id < ?)
                ) AS rankings
            `, [
                currentUser?.xp_earned || 0,
                currentUser?.xp_earned || 0,
                user_id
            ]);

            if (currentUser) currentUser.player_rank = rankResult.player_rank;
        }

        res.status(200).json({
            rows,
            currentUser: currentUser || null
        })
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

// Get Top Scores by Game based on time period
export async function getGameLeaderboard(req, res) {
    const {game, period} = req.query;
    const periodFilter =
        period === 'daily' ? 'AND DATE(us.played_at) = CURDATE()' :
            period === 'weekly' ? 'AND us.played_at >= NOW() - INTERVAL 7 DAY' :
                period === 'monthly' ? 'AND us.played_at >= NOW() - INTERVAL 30 DAY' : '';

    try {
        let rows;
        switch(game) {
            case 'Reaction Time':
                [rows] = await pool.query(`
                    SELECT username, average, best, xp_earned, played_at
                    FROM (
                        SELECT 
                            u.username, 
                            rts.average, 
                            rts.best, 
                            us.xp_earned, 
                            us.played_at,
                            ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY rts.average ASC, rts.best ASC, us.played_at ASC) as user_rank
                        FROM user_scores us
                        JOIN reaction_time_scores rts ON us.score_id = rts.id
                        JOIN users u ON us.user_id = u.id
                        WHERE us.games_id = 1 ${periodFilter}
                    ) ranked_scores
                    WHERE user_rank = 1
                    ORDER BY average ASC
                    LIMIT 10
                `);
                break;

            case 'Sequence Memory':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.max_level AS level_reached, 
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(ss_inner.level_reached) as max_level,
                            SUM(CASE WHEN ss_inner.level_reached = (
                                SELECT MAX(level_reached) 
                                FROM sequence_scores s2 
                                JOIN user_scores u2 ON s2.id = u2.score_id 
                                WHERE u2.user_id = us_inner.user_id AND u2.games_id = 2
                            ) THEN 1 ELSE 0 END) as times_reached
                        FROM user_scores us_inner
                        JOIN sequence_scores ss_inner ON us_inner.score_id = ss_inner.id
                        WHERE us_inner.games_id = 2 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN sequence_scores ss ON us.score_id = ss.id
                    WHERE us.games_id = 2 AND ss.level_reached = ub.max_level
                    GROUP BY u.username, ub.max_level, ub.times_reached
                    ORDER BY level_reached DESC, times_reached DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Number Memory':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.max_level AS level_reached, 
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(ns_inner.level_reached) as max_level,
                            (
                                SELECT COUNT(*) 
                                FROM user_scores us2
                                JOIN number_scores ns2 ON us2.score_id = ns2.id
                                WHERE us2.user_id = us_inner.user_id 
                                AND us2.games_id = 3
                                AND ns2.level_reached = MAX(ns_inner.level_reached)
                            ) as times_reached
                        FROM user_scores us_inner
                        JOIN number_scores ns_inner ON us_inner.score_id = ns_inner.id
                        WHERE us_inner.games_id = 3 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN number_scores ns ON us.score_id = ns.id
                    WHERE us.games_id = 3 AND ns.level_reached = ub.max_level
                    GROUP BY u.username, ub.max_level, ub.times_reached
                    ORDER BY level_reached DESC, times_reached DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Verbal Memory':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.max_score AS score, 
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(vs_inner.score) as max_score,
                            (
                                SELECT COUNT(*) 
                                FROM user_scores us2
                                JOIN verbal_scores vs2 ON us2.score_id = vs2.id
                                WHERE us2.user_id = us_inner.user_id 
                                AND us2.games_id = 4
                                AND vs2.score = MAX(vs_inner.score)
                            ) as times_reached
                        FROM user_scores us_inner
                        JOIN verbal_scores vs_inner ON us_inner.score_id = vs_inner.id
                        WHERE us_inner.games_id = 4 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN verbal_scores vs ON us.score_id = vs.id
                    WHERE us.games_id = 4 AND vs.score = ub.max_score
                    GROUP BY u.username, ub.max_score, ub.times_reached
                    ORDER BY score DESC, times_reached DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Visual Memory':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.max_level AS level_reached, 
                        MAX(vs.max_grid_size) AS max_grid_size,
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(vs_inner.level_reached) as max_level,
                            (
                                SELECT COUNT(*) 
                                FROM user_scores us2
                                JOIN visual_scores vs2 ON us2.score_id = vs2.id
                                WHERE us2.user_id = us_inner.user_id 
                                AND us2.games_id = 5
                                AND vs2.level_reached = MAX(vs_inner.level_reached)
                            ) as times_reached
                        FROM user_scores us_inner
                        JOIN visual_scores vs_inner ON us_inner.score_id = vs_inner.id
                        WHERE us_inner.games_id = 5 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN visual_scores vs ON us.score_id = vs.id
                    WHERE us.games_id = 5 AND vs.level_reached = ub.max_level
                    GROUP BY u.username, ub.max_level, ub.times_reached
                    ORDER BY level_reached DESC, times_reached DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Typing Speed':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        MAX(tss.wpm) AS wpm, 
                        MAX(tss.accuracy) AS accuracy, 
                        MAX(tss.words_typed) AS words_typed, 
                        MAX(us.xp_earned) AS xp_earned, 
                        MAX(us.played_at) AS played_at,
                        ub.total_played
                    FROM user_scores us
                    JOIN typing_speed_scores tss ON us.score_id = tss.id
                    JOIN users u ON us.user_id = u.id
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(tss_inner.wpm * (tss_inner.accuracy / 100)) as max_weighted_score,
                            COUNT(*) as total_played
                        FROM user_scores us_inner
                        JOIN typing_speed_scores tss_inner ON us_inner.score_id = tss_inner.id
                        WHERE us_inner.games_id = 6 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id 
                        AND (tss.wpm * (tss.accuracy / 100)) = ub.max_weighted_score
                    WHERE us.games_id = 6 ${periodFilter}
                    GROUP BY u.username, ub.total_played
                    ORDER BY (MAX(tss.wpm) * (MAX(tss.accuracy) / 100)) DESC, wpm DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Rock Paper Scissors':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.max_wins AS wins, 
                        ub.min_losses AS losses,
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached,
                        ub.total_played
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(rps_inner.wins) as max_wins,
                            (SELECT MIN(losses) FROM rockpaperscissors_scores r2
                             JOIN user_scores us2 ON r2.id = us2.score_id
                             WHERE us2.user_id = us_inner.user_id AND r2.wins = MAX(rps_inner.wins)) as min_losses,
                            (SELECT COUNT(*) FROM user_scores us3
                             JOIN rockpaperscissors_scores rps3 ON us3.score_id = rps3.id
                             WHERE us3.user_id = us_inner.user_id AND us3.games_id = 7
                             AND rps3.wins = MAX(rps_inner.wins)
                             AND rps3.losses = (SELECT MIN(losses) FROM rockpaperscissors_scores r4 
                                                JOIN user_scores us4 ON r4.id = us4.score_id
                                                WHERE us4.user_id = us_inner.user_id AND r4.wins = MAX(rps_inner.wins))) as times_reached,
                            (SELECT COUNT(*) FROM user_scores us_total 
                             WHERE us_total.user_id = us_inner.user_id AND us_total.games_id = 7) as total_played
                        FROM user_scores us_inner
                        JOIN rockpaperscissors_scores rps_inner ON us_inner.score_id = rps_inner.id
                        WHERE us_inner.games_id = 7 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN rockpaperscissors_scores rps ON us.score_id = rps.id
                    WHERE us.games_id = 7 AND rps.wins = ub.max_wins AND rps.losses = ub.min_losses
                    GROUP BY u.username, ub.max_wins, ub.min_losses, ub.times_reached, ub.total_played
                    ORDER BY wins DESC, losses ASC, times_reached DESC, played_at DESC 
                    LIMIT 10
                `);
                break;

            case 'Tic-Tac-Toe':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        SUM(ttt.played) AS total_played, 
                        SUM(ttt.wins) AS wins, 
                        SUM(ttt.draws) AS draws, 
                        SUM(ttt.losses) AS losses, 
                        MAX(us.played_at) AS played_at, 
                        SUM(us.xp_earned) AS xp_earned
                    FROM user_scores us
                        JOIN tictactoe_scores ttt ON us.score_id = ttt.id
                        JOIN users u ON us.user_id = u.id
                    WHERE us.games_id = 8 ${periodFilter}
                    GROUP BY u.username
                    ORDER BY wins DESC, losses ASC, total_played DESC 
                    LIMIT 10
                `);
                break;

            case 'Wordle':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        ub.min_attempts AS attempts, 
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached,
                        ub.total_played
                    FROM users u
                    JOIN (
                        SELECT 
                            us_inner.user_id,
                            MIN(w_inner.attempts) as min_attempts,
                            COUNT(CASE WHEN w_inner.attempts = (
                                SELECT MIN(attempts) 
                                FROM wordle_scores w2 
                                JOIN user_scores us2 ON w2.id = us2.score_id 
                                WHERE us2.user_id = us_inner.user_id AND us2.games_id = 9 AND w2.found = 'Yes'
                            ) THEN 1 END) as times_reached,
                            COUNT(*) as total_played
                        FROM user_scores us_inner
                        JOIN wordle_scores w_inner ON us_inner.score_id = w_inner.id
                        WHERE us_inner.games_id = 9 AND w_inner.found = 'Yes' ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id
                    JOIN user_scores us ON u.id = us.user_id
                    JOIN wordle_scores w ON us.score_id = w.id
                    WHERE us.games_id = 9 AND w.attempts = ub.min_attempts AND w.found = 'Yes'
                    GROUP BY u.username, ub.min_attempts, ub.times_reached, ub.total_played
                    ORDER BY attempts ASC, times_reached DESC, total_played DESC 
                    LIMIT 10
                `);
                break;

            case 'Quick Maths':
                [rows] = await pool.query(`
                    SELECT 
                        u.username, 
                        MAX(qms.score) AS score, 
                        MAX(qms.accuracy) AS accuracy, 
                        MIN(qms.avg_response_time) AS avg_response_time,
                        MAX(us.played_at) AS played_at, 
                        MAX(us.xp_earned) AS xp_earned,
                        ub.times_reached,
                        ub.total_played
                    FROM user_scores us
                    JOIN quick_math_scores qms ON us.score_id = qms.id
                    JOIN users u ON us.user_id = u.id
                    JOIN (
                        SELECT 
                            us_inner.user_id, 
                            MAX(qms_inner.score * (qms_inner.accuracy / 100)) as max_weighted,
                            SUM(CASE WHEN (qms_inner.score * (qms_inner.accuracy / 100)) = (
                                SELECT MAX(q2.score * (q2.accuracy / 100))
                                FROM quick_math_scores q2
                                JOIN user_scores us2 ON q2.id = us2.score_id
                                WHERE us2.user_id = us_inner.user_id AND us2.games_id = 10
                            ) THEN 1 ELSE 0 END) as times_reached,
                            COUNT(*) as total_played
                        FROM user_scores us_inner
                        JOIN quick_math_scores qms_inner ON us_inner.score_id = qms_inner.id
                        WHERE us_inner.games_id = 10 ${periodFilter}
                        GROUP BY us_inner.user_id
                    ) AS ub ON u.id = ub.user_id 
                        AND (qms.score * (qms.accuracy / 100)) = ub.max_weighted
                    WHERE us.games_id = 10 ${periodFilter}
                    GROUP BY u.username, ub.times_reached, ub.total_played
                    ORDER BY (MAX(qms.score) * (MAX(qms.accuracy) / 100)) DESC, avg_response_time ASC, times_reached DESC
                    LIMIT 10
                `);
                break;

            default:
                return res.status(400).json({message: 'Invalid Game'});
        }

        res.status(200).json({rows});
    } catch(err) {
        console.error(err.message);
        return res.status(500).json({message: 'Server Error', error: err.message})
    }
}
import pool from '../db/index.js';

// Get user info for Home.jsx
export async function getUserInfo(req, res) {
    try{
        const [rows] = await pool.query(`
            SELECT id, username, email, xp
            FROM users 
            WHERE id = ?
        `, [req.user.id])
        res.json(rows[0])
    } catch(err) {
        res.status(500).send({error: err});
    }
}

// User's total XP and level
export async function getUserStats(req, res) {
    const {username} = req.query;
    const user_id = username ?
        (await pool.query(`SELECT id FROM users WHERE username = ?`, [username]))[0][0]?.id :
        req.user.id;

    try{
        // Total XP and RANK
        const [[user_stats]] = await pool.query(`
            SELECT username, xp, streak, avatar, is_public,
                (SELECT COUNT(*) FROM users 
                    WHERE xp > (SELECT xp from users WHERE id = ?)
                ) + 1 AS player_rank
            FROM users WHERE id = ?
        `, [user_id, user_id])

        // Total games played
        const [[{games_played}]] = await pool.query(`
            SELECT COUNT(*) as games_played 
            FROM user_scores WHERE user_id = ?
        `, [user_id])

        const [[favorite]] = await pool.query(`
            SELECT g.id, g.name, g.emoji, COUNT(*) AS count
            FROM games g
                JOIN user_scores us ON g.id = us.games_id
            WHERE us.user_id = ?
            GROUP BY g.id, g.name, g.emoji
            ORDER BY count DESC LIMIT 1
        `, [user_id])

        // Handle Streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastJoin = user_stats.last_joined ? new Date(user_stats.last_joined) : null;
        let displayStreak = user_stats.streak;

        if (lastJoin) {
            lastJoin.setHours(0, 0, 0, 0);
            const diffInDays = Math.floor((today - lastJoin) / (1000 * 60 * 60 * 24));

            if (diffInDays > 1) {
                displayStreak = 0;
            }
        }

        res.status(200).json({
            user_stats : {
                ...user_stats,
                streak: displayStreak
            },
            games_played,
            favorite: {
                name: favorite ? `${favorite.emoji} ${favorite.name}` : '',
                count: favorite ? `${favorite.count}` : ''
            },
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

// Get 5 most recent achievements unlocked
export async function getRecentAchievements (req, res) {
    const {username} = req.query;
    const user_id = username ?
        (await pool.query(`SELECT id FROM users WHERE username = ?`, [username]))[0][0]?.id :
        req.user.id;

    try {
        const [rows] = await pool.query(`
            SELECT a.name, a.description, a.emoji, ua.unlocked_at
            FROM user_achievements ua
                JOIN achievements a ON ua.achievement_id = a.id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at DESC
            LIMIT 5
        `, [user_id])

        res.status(200).json({achievements: rows || []})
    } catch(err) {
        console.log(err)
        res.status(500).send({error: err});
    }
}

// Top 5 best scores per game for the user
export async function getUserBestScores(req, res) {
    const {username, period} = req.query;
    const user_id = username ?
        (await pool.query(`SELECT id FROM users WHERE username = ?`, [username]))[0][0]?.id :
        req.user.id;

    const periodFilter =
        period === 'daily' ? 'AND DATE(us.played_at) = CURDATE()' :
            period === 'weekly' ? 'AND us.played_at >= NOW() - INTERVAL 7 DAY' :
                period === 'monthly' ? 'AND us.played_at >= NOW() - INTERVAL 30 DAY' :
                    '';

    try{
        // Reaction time - average
        const [reaction] = await pool.query(`
            SELECT rts.best, rts.average, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN reaction_time_scores rts ON us.score_id = rts.id
            WHERE us.user_id = ? AND us.games_id = 1 ${periodFilter}
            ORDER BY rts.average ASC LIMIT 15
        `, user_id)

        // Sequence Memory - best level
        const [sequence] = await pool.query(`
            SELECT ss.level_reached, ss.sequence, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN sequence_scores ss ON us.score_id = ss.id
            WHERE us.user_id = ? AND us.games_id = 2 ${periodFilter}
            ORDER BY ss.level_reached DESC LIMIT 15
        `, user_id)

        // Number Memory - best level
        const [number] = await pool.query(`
            SELECT ns.level_reached, ns.number_fail, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN number_scores ns ON us.score_id = ns.id
            WHERE us.user_id = ? AND us.games_id = 3 ${periodFilter}
            ORDER BY ns.level_reached DESC LIMIT 15
        `, user_id)

        // Verbal Memory - best score
        const [verbal] = await pool.query(`
            SELECT vs.score, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN verbal_scores vs ON us.score_id = vs.id
            WHERE us.user_id = ? AND us.games_id = 4 ${periodFilter}
            ORDER BY vs.score DESC LIMIT 15
        `, user_id)

        // Visual Memory - best score
        const [visual] = await pool.query(`
            SELECT vs.level_reached, vs.max_grid_size, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN visual_scores vs ON us.score_id = vs.id
            WHERE us.user_id = ? AND us.games_id = 5 ${periodFilter}
            ORDER BY vs.level_reached DESC LIMIT 15
        `, user_id)

        // Typing Speed - Best WPM
        const [typing] = await pool.query(`
            SELECT tss.words_typed, tss.wpm, tss.accuracy, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN typing_speed_scores tss ON us.score_id = tss.id
            WHERE us.user_id = ? AND us.games_id = 6 ${periodFilter}
            ORDER BY tss.wpm DESC LIMIT 15
        `, user_id)

        // Rock Paper Scissors - Biggest Wins (least amount of losses)
        const [rps] = await pool.query(`
            SELECT rps.played, rps.wins, rps.losses, rps.result, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN rockpaperscissors_scores rps ON us.score_id = rps.id
            WHERE us.user_id = ? AND us.games_id = 7 AND rps.result = 'Won' ${periodFilter}
            ORDER BY rps.losses ASC, rps.wins DESC LIMIT 15
        `, user_id)

        // TicTacToe - Most Wins
        const [tictactoe] = await pool.query(`
            SELECT ttt.played, ttt.wins, ttt.losses, ttt.result, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN tictactoe_scores ttt ON us.score_id = ttt.id
            WHERE us.user_id = ? AND us.games_id = 8 AND ttt.result = 'Won' ${periodFilter}
            ORDER BY ttt.wins DESC LIMIT 15
        `, user_id)

        // Wordle - Least Attempts
        const [wordle]  = await pool.query(`
            SELECT w.attempts, w.found, w.word_target, us.xp_earned, us.played_at
            FROM user_scores us 
                JOIN wordle_scores w ON us.score_id = w.id
            WHERE us.user_id = ? AND us.games_id = 9 ${periodFilter}
            ORDER BY w.attempts ASC LIMIT 15 
        `, user_id)

        // Quick Maths - Best scores with best accuracy
        const [maths] = await pool.query(`
            SELECT qm.score, qm.total, qm.avg_response_time, qm.accuracy, us.xp_earned, us.played_at
            FROM user_scores us
                JOIN quick_math_scores qm ON us.score_id = qm.id
            WHERE us.user_id = ? AND us.games_id = 10 ${periodFilter}
            ORDER BY (qm.score * (qm.accuracy / 100)) DESC, qm.avg_response_time ASC 
            LIMIT 15 
        `, user_id)

        // XP per game for selected period
        const [xpByGame] = await pool.query(`
            SELECT games_id, COALESCE(SUM(xp_earned), 0) AS xp
            FROM user_scores us
            WHERE user_id = ? ${periodFilter}
            GROUP BY games_id
        `, [user_id])

        res.status(200).json({
            reaction,
            sequence,
            number,
            verbal,
            visual,
            typing,
            rps,
            tictactoe,
            wordle,
            maths,
            xpByGame
        })
    }catch(err){
        console.log(err)
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}

// Get 20 most recent games
export async function getRecentGames(req, res) {
    const {username} = req.query;
    const user_id = username ?
        (await pool.query(`SELECT id FROM users WHERE username = ?`, [username]))[0][0]?.id :
        req.user.id;

    try {
        const [result] = await pool.query(`
            SELECT 'Reaction Time' AS game, '⚡' AS emoji, us.played_at, us.xp_earned,
                CONCAT(rts.best, 'ms best / ', rts.average, 'ms avg') AS summary
            FROM user_scores us
                JOIN reaction_time_scores rts ON us.score_id = rts.id
            WHERE us.user_id = ? AND us.games_id = 1

            UNION ALL

            SELECT 'Sequence Memory', '🧠', us.played_at, us.xp_earned,
                CONCAT('Level ', ss.level_reached) AS summary
            FROM user_scores us
                JOIN sequence_scores ss ON us.score_id = ss.id
            WHERE us.user_id = ? AND us.games_id = 2

            UNION ALL

            SELECT 'Number Memory', '🔢', us.played_at, us.xp_earned,
                CONCAT('Level ', ns.level_reached) AS summary
            FROM user_scores us
                JOIN number_scores ns ON us.score_id = ns.id
            WHERE us.user_id = ? AND us.games_id = 3

            UNION ALL

            SELECT 'Verbal Memory', '📝', us.played_at, us.xp_earned,
                CONCAT(vs.score, ' points') AS summary
            FROM user_scores us
                JOIN verbal_scores vs ON us.score_id = vs.id
            WHERE us.user_id = ? AND us.games_id = 4

            UNION ALL

            SELECT 'Visual Memory', '💫', us.played_at, us.xp_earned,
                CONCAT('Level ', vs.level_reached, ' / ', vs.max_grid_size, 'x', vs.max_grid_size, ' grid') AS summary
            FROM user_scores us
                JOIN visual_scores vs ON us.score_id = vs.id
            WHERE us.user_id = ? AND us.games_id = 5

            UNION ALL

            SELECT 'Typing Speed', '⌨️', us.played_at, us.xp_earned,
                CONCAT(tss.wpm, ' WPM / ', tss.accuracy, '% accuracy') AS summary
            FROM user_scores us
                JOIN typing_speed_scores tss ON us.score_id = tss.id
            WHERE us.user_id = ? AND us.games_id = 6

            UNION ALL

            SELECT 'Rock Paper Scissors', '✂️', us.played_at, us.xp_earned,
                CONCAT(rps.result, ' / ', rps.wins, 'W - ', rps.losses, 'L') AS summary
            FROM user_scores us
                JOIN rockpaperscissors_scores rps ON us.score_id = rps.id
            WHERE us.user_id = ? AND us.games_id = 7

            UNION ALL

            SELECT 'Tic-Tac-Toe', '❌', us.played_at, us.xp_earned,
                CONCAT(ttt.result, ' / ', ttt.wins, 'W - ', ttt.losses, 'L') AS summary
            FROM user_scores us
                JOIN tictactoe_scores ttt ON us.score_id = ttt.id
            WHERE us.user_id = ? AND us.games_id = 8
            
            UNION ALL
            
            SELECT 'Wordle', '🔡', us.played_at, us.xp_earned,
                CONCAT(w.found, ' / ', w.word_target, ' - ', w.attempts, ' Attempts') AS summary
            FROM user_scores us
                JOIN wordle_scores w ON us.score_id = w.id
            WHERE us.user_id = ? AND us.games_id = 9
            
            UNION ALL
            
            SELECT 'Quick Maths', '➕', us.played_at, us.xp_earned,
                CONCAT(qm.score, ' Points / ', qm.accuracy, '% (', qm.total, ' total) - ', qm.avg_response_time, 's per Correct') AS summary 
            FROM user_scores us
                JOIN quick_math_scores qm ON us.score_id = qm.id
            WHERE us.user_id = ? AND us.games_id = 10

            ORDER BY played_at DESC LIMIT 100
        `, [user_id, user_id, user_id, user_id, user_id,
            user_id, user_id, user_id, user_id, user_id])

        return res.status(200).json(result);
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Server Error', error: err.message });
    }
}
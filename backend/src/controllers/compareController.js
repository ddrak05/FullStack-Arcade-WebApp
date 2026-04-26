import pool from '../db/index.js';

export async function getComparisonData (req, res) {
    const myId = req.user.id;
    const {username: otherUsername} = req.params;
    const {period = 'all-time'} = req.query;

    try {
        // Other User's Info
        const [otherRows] = await pool.query(`
            SELECT id
            FROM users
            WHERE username = ?
        `, [otherUsername]);

        if (otherRows.length === 0) {
            return res.status(404).json({error: 'User not found'})
        }
        const otherId = otherRows[0].id;

        // Get overview for both
        const myStats = await getOverview(myId);
        const otherStats = await getOverview(otherId);

        // Get best score for both
        const myBest = await getBestScore(myId, period);
        const otherBest = await getBestScore(otherId, period);

        const [games] = await pool.query(`
            SELECT id, name, emoji FROM games
        `)

        const scoreMapping = {
            1: {key: 'reaction', label: 'Best Average'},
            2: {key: 'sequence', label: 'Highest Level'},
            3: {key: 'number', label: 'Highest Level'},
            4: {key: 'verbal', label: 'Highest Points'},
            5: {key: 'visual', label: 'Highest Level'},
            6: {key: 'typing', label: 'Best Speed'},
            7: {key: 'rps', label: 'Total Wins'},
            8: {key: 'ttt', label: 'Total Wins'},
            9: {key: 'wordle', label: 'Words Found'},
            10: {key: 'maths', label: 'Highest Points'}
        };

        const gamesComparison = games.map(game => {
            const key = scoreMapping[game.id]
            return {
                id: game.id,
                name: game.name,
                emoji: game.emoji,
                label: key.label,
                myValue: myBest[key.key] || 0,
                otherValue: otherBest[key.key] || 0
            }
        })

        return res.status(200).json({
            myStats,
            otherStats,
            gamesComparison
        });
    } catch(err) {
        return res.status(500).json({error: err.message})
    }
}

async function getOverview (userId) {
    // Get Achievement Count
    const [ach] = await pool.query(`
        SELECT COUNT(*) AS count FROM user_achievements WHERE user_id = ?
    `, [userId]);

    // Get Total Games Played
    const [games] = await pool.query(`
        SELECT COUNT(*) AS count FROM user_scores WHERE user_id = ?
    `, [userId]);

    // Get XP and Level
    const [user] = await pool.query(`
        SELECT xp, username,
            (SELECT COUNT(*) FROM users 
                WHERE xp > (SELECT xp from users WHERE id = ?)
            ) + 1 AS player_rank
        FROM users WHERE id = ?
    `, [userId, userId]);
    const xp = user[0].xp || 0;
    const level = Math.floor(Math.sqrt(xp / 100) + 1);

    // Get Favorite Game
    const [favorite] = await pool.query(`
        SELECT g.name, COUNT(*) AS played
        FROM user_scores us
            JOIN games g ON us.games_id = g.id
        WHERE us.user_id = ?
        GROUP BY us.games_id
        ORDER BY played DESC 
        LIMIT 1
    `, [userId])
    const fav = favorite[0] ?
        `${favorite[0].name} (${favorite[0].played} games)`
        : '-';

    return {
        username: user[0].username,
        xp,
        level,
        rank: user[0].player_rank,
        achievements: ach[0].count,
        totalGames: games[0].count,
        favorite: {
            data: fav,
            played: favorite[0]?.played || 0
        }
    }
}

async function getBestScore(userId, period) {
    const filter =
        period === 'daily' ? 'AND DATE(us.played_at) = CURDATE()' :
            period === 'weekly' ? 'AND us.played_at >= NOW() - INTERVAL 7 DAY' :
                period === 'monthly' ? 'AND us.played_at >= NOW() - INTERVAL 30 DAY' :
                    '';

    const [react] = await pool.query(`
        SELECT MIN(s.average) AS val, AVG(s.average) AS avg
        FROM user_scores us
            JOIN reaction_time_scores s ON us.score_id = s.id 
        WHERE user_id = ? AND us.games_id = 1 ${filter}
    `, [userId])

    const [sequence] = await pool.query(`
        SELECT MAX(s.level_reached) AS val
        FROM user_scores us
            JOIN sequence_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 2 ${filter}
    `, [userId])

    const [number] = await pool.query(`
        SELECT MAX(s.level_reached) AS val
        FROM user_scores us
            JOIN number_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 3 ${filter}
    `, [userId])

    const [verbal] = await pool.query(`
        SELECT MAX(s.score) AS val
        FROM user_scores us
            JOIN verbal_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 4 ${filter}
    `, [userId])

    const [visual] = await pool.query(`
        SELECT MAX(s.level_reached) AS val
        FROM user_scores us
            JOIN visual_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 5 ${filter}
    `, [userId])

    const [typing] = await pool.query(`
        SELECT s.wpm AS val, s.accuracy
        FROM user_scores us
            JOIN typing_speed_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 6 ${filter}
        ORDER BY s.wpm DESC
        LIMIT 1
    `, [userId])

    const [rps] = await pool.query(`
        SELECT 
            COUNT(*) AS played,
            SUM(CASE WHEN s.result = 'Won' THEN 1 ELSE 0 END) AS wins,
            SUM(CASE WHEN s.result = 'Lost' THEN 1 ELSE 0 END) AS losses
        FROM user_scores us
            JOIN rockpaperscissors_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 7 ${filter}
    `, [userId])

    const [ttt] = await pool.query(`
        SELECT 
            SUM(s.played) AS played, SUM(s.wins) AS wins, SUM(s.losses) AS losses
        FROM user_scores us
            JOIN tictactoe_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 8 ${filter}
    `, [userId])

    const [wordle] = await pool.query(`
        SELECT 
            SUM(CASE WHEN s.found = 'Yes' THEN 1 ELSE 0 END) AS total_found,
            COUNT(*) AS total_games,
            ROUND(SUM(CASE WHEN s.found = 'Yes' THEN 1 ELSE 0 END) / COUNT(*) * 100) AS win_rate
        FROM user_scores us
            JOIN wordle_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 9 ${filter}
    `, [userId]);

    const [maths] = await pool.query(`
        SELECT s.score, s.accuracy
        FROM user_scores us
            JOIN quick_math_scores s ON us.score_id = s.id
        WHERE us.user_id = ? AND us.games_id = 10 ${filter}
        ORDER BY (s.score * (s.accuracy / 100)) DESC
        LIMIT 1
    `, [userId]);

    return {
        reaction: {
            val: react[0]?.val,
            rec: react[0]?.avg ? ` (All Time: ${Math.round(react[0].avg)}ms)` : ''        },
        sequence: {
            val: sequence[0]?.val
        },
        number: {
            val: number[0]?.val
        },
        verbal: {
            val: verbal[0]?.val
        },
        visual: {
            val: visual[0]?.val
        },
        typing: {
            val: typing[0]?.val,
            rec: typing[0] ? ` (${typing[0].accuracy}%)` : ''
        },
        rps: {
            val: rps[0]?.wins,
            rec: rps[0]?.played ? ` (P${rps[0].played} : ${rps[0].wins}W - ${rps[0].losses}L)` : ''
        },
        ttt: {
            val: ttt[0]?.wins,
            rec: ttt[0]?.played ? ` (P${ttt[0].played} : ${ttt[0].wins}W - ${ttt[0].losses}L)` : ''
        },
        wordle: {
            val: wordle[0]?.total_found || 0,
            rec: wordle[0]?.total_games > 0 ? ` (${wordle[0].win_rate}%)` : ''
        },
        maths: {
            val: maths[0]?.score || 0,
            rec: maths[0] ? ` (${maths[0].accuracy}%)` : ''
        }
    }
}
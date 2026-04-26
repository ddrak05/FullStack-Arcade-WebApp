// General Achievements
import pool from '../../db/index.js'

export const globalRules = {
    // Total games played per game
    game_count: async (target, userId, gamesId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM user_scores 
            WHERE user_id = ? AND games_id = ?
        `, [userId, gamesId]);
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Total games played across all games
    global_count: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM user_scores
            WHERE user_id = ?
        `, [userId])

        const progress = rows[0].count;
        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Total user level
    global_level: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT xp FROM users WHERE id = ?
        `, [userId])

        const progress = Math.floor(Math.sqrt(rows[0]?.xp / 100) + 1)
        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Every game played at least {target} times
    all_games_milestone: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(games_id) AS distinct_games
            FROM user_scores 
            WHERE user_id = ?
            GROUP BY games_id
            HAVING COUNT(*) >= ?
        `, [userId, target])

        const progress = rows.length
        return {
            isUnlocked: progress === 10,
            progress: progress,
            target: 10
        }
    },

    // Played every game in one day
    daily_marathon: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(DISTINCT games_id) AS distinct_games
            FROM user_scores 
            WHERE user_id = ?
                AND played_at >= CURDATE()
        `, [userId])

        const progress = rows[0].distinct_games || 0;
        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Number of games played in a day
    daily_games : async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(id) AS played
            FROM user_scores 
            WHERE user_id = ?
                AND played_at >= CURDATE()
        `, [userId])

        const progress = rows[0].played || 0
        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    }
}
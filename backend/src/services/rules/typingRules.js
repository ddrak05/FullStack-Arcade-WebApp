// Achievement rules for Typing Speed
import pool from '../../db/index.js'

export const typingRules = {
    // Finished with 100% Accuracy
    accuracy_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(us.id) AS count
            FROM typing_speed_scores ts
                JOIN user_scores us ON ts.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 6
                AND ts.accuracy >= 100 AND ts.wpm >= 30
        `, [userId])
        const progress = rows[0].count || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Finished with over target wpm
    wpm_over: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(wpm) as best 
            FROM typing_speed_scores ts
                JOIN user_scores us ON ts.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 6
        `, [userId]);
        const progress = rows[0]?.best || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        };
    },

    // Times reached target wpm
    wpm_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM typing_speed_scores ts
                JOIN user_scores u ON ts.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 6
                AND ts.wpm >= ?
        `, [userId, target]);
        const count = rows[0].count || 0;

        return {
            isUnlocked: count >= 20,
            progress: count,
            target: 20
        };
    },

    // Finished with over target accuracy
    perfect_speed: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(ts.wpm) as best
            FROM typing_speed_scores ts
                JOIN user_scores us ON ts.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 6
                AND ts.accuracy >= 100
        `, [userId]);
        const progress = rows[0]?.best || 0;

        return {
            isUnlocked: progress >= target,
            progress: `${progress}`,
            target: target
        };
    }
}
// Achievement rules for Visual Memory
import pool from "../../db/index.js";

export const visualRules = {
    // Grid reached
    grid_reached: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(max_grid_size) as best 
            FROM visual_scores v
                JOIN user_scores us ON v.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 5
        `, [userId]);
        const progress = rows[0]?.best || 0;

        return {
            isUnlocked: progress >= target,
            progress: `${progress}x${progress}`,
            target: `${target}x${target}`
        };
    },

    // Times a grid size was reached
    grid_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM visual_scores v
                JOIN user_scores u ON v.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 5 
                AND v.max_grid_size >= ?
        `, [userId, target]);
        const count = rows[0].count || 0;

        return {
            isUnlocked: count >= 15,
            progress: count,
            target: 15
        };
    },

    clear_grid: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(v.level_reached) AS level
            FROM visual_scores v
                JOIN user_scores u ON v.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 5
        `, [userId])
        const progress = rows[0].level || 0;

        return {
            isUnlocked: progress >= target,
            progress: `Lvl ${progress}`,
            target: target
        }
    }
}
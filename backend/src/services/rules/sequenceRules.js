// Achievement rules for Sequence Memory
import pool from "../../db/index.js";

export const sequenceRules = {
    // Level Reached
    level_reached: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(level_reached) as best 
            FROM sequence_scores s
                JOIN user_scores us ON s.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 2
        `, [userId]);
        const progress = rows[0].best || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Times reached a specific level
    level_repeat: async (target, userId) => {
        let level = 25;
        if (target === 20 || target === 5) level = 15;

        const [rows] = await pool.query(`
            SELECT COUNT(*) as count 
            FROM sequence_scores s
                JOIN user_scores us ON s.id = us.score_id
            WHERE us.user_id = ? 
                AND us.games_id = 2 
                AND s.level_reached >= ?
        `, [userId, level]);

        const progress = rows[0].count || 0
        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    streak_milestone: async (target, userId) => {
        let limit = 2;
        if (target === 30) limit = 3;

        const [rows] = await pool.query(`
            SELECT s.level_reached
            FROM user_scores us
                JOIN sequence_scores s ON s.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 2
            ORDER BY us.played_at DESC
            LIMIT ?
        `, [userId, limit])
        const progress = rows.filter(r => r.level_reached >= target).length

        return {
            isUnlocked: progress >= limit,
            progress: progress,
            target: limit
        }
    }
}
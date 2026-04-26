// Achievement rules for Number Memory
import pool from "../../db/index.js";

export const numberRules = {
    // Digit count check
    digits_reached: async (target, userId) => {
        const [rows] = await pool.query(`
             SELECT MAX(level_reached) as best
             FROM number_scores n
                JOIN user_scores us ON n.id = us.score_id
             WHERE us.user_id = ? AND us.games_id = 3
        `, [userId]);
        const progress = rows[0]?.best || 0;
        const digits = Math.max(0, progress - 1);

        return {
            isUnlocked: digits >= target,
            progress: digits,
            target: target
        };
    },

    // Count how many times they hit at least 10 digits
    digit_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count 
            FROM number_scores n 
                JOIN user_scores u ON u.score_id = n.id
            WHERE u.user_id = ? AND u.games_id = 3 
                AND n.level_reached >= ? 
        `, [userId, target + 1]);
        const count = rows[0].count || 0;

        return {
            isUnlocked: count >= target,
            progress: count,
            target: target
        };
    },

    digit_streak: async (target, userId) => {
        let limit = 3;
        if (target === 12) limit = 5;

        const [rows] = await pool.query(`
            SELECT n.level_reached
            FROM number_scores n
                JOIN user_scores us ON us.score_id = n.id
            WHERE us.user_id = ? AND us.games_id = 3
            ORDER BY us.played_at DESC
            LIMIT ?
        `, [userId, limit])

        let currentStreak = 0;
        for (const row of rows) {
            if (row.level_reached >= target + 1) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            isUnlocked: currentStreak >= limit,
            progress: currentStreak,
            target: limit
        }
    }
}
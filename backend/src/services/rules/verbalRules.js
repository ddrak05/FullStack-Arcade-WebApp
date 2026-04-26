// Achievement rules for Verbal Memory
import pool from "../../db/index.js";

export const verbalRules = {
    // Score in a single game played
    verbal_score: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(score) as best 
            FROM verbal_scores v
                JOIN user_scores us ON v.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 4
        `, [userId]);
        const progress = rows[0]?.best || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        };
    },

    // Total words identified
    total_words_seen: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT SUM(score) as total_score
            FROM verbal_scores v
            JOIN user_scores us ON us.score_id = v.id
            WHERE us.user_id = ? AND us.games_id = 4
        `, [userId]);

        const progress = rows[0].total_score || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        };
    }
}
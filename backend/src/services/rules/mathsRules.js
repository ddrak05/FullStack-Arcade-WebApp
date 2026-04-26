// Achievement rules for Quick Maths
import pool from "../../db/index.js";

export const mathsRules = {
    // 15+ with over 80%
    score_accuracy_combo: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM quick_math_scores qm
                JOIN user_scores us ON qm.id = us.score_id
            WHERE user_id = ? AND games_id = 10 AND qm.score >= 15 AND qm.accuracy >= 80
        `, [userId])
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // 10+ with 100%
    perfect_accuracy_min: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM quick_math_scores qm
                JOIN user_scores us ON qm.id = us.score_id
            WHERE user_id = ? AND games_id = 10 AND qm.score >= 10 AND qm.accuracy >= 100
        `, [userId])
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Over a specific score
    score_reached: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MAX(qm.score) AS best
            FROM quick_math_scores qm
                JOIN user_scores us ON qm.id = us.score_id
            WHERE user_id = ? AND games_id = 10
        `, [userId, target])
        const progress = rows[0].best || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    },

    // Over 12 points for {target} games in a row
    score_streak: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT qm.score
            FROM quick_math_scores qm
                JOIN user_scores us ON qm.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 10
            ORDER BY us.played_at DESC
            LIMIT ?
        `, [userId, target]);

        let currentStreak = 0;
        for (const row of rows) {
            if (row.score >= 12) {
                currentStreak++;
            } else {
                break;
            }
        }

        return {
            isUnlocked: currentStreak >= target,
            progress: currentStreak,
            target: target
        };
    },

    // Total correct answers
    total_correct_answers: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT SUM(qm.score) AS total
            FROM quick_math_scores qm
                JOIN user_scores us ON qm.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 10
        `, [userId])
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    }
}

// Achievement rules for Wordle
import pool from "../../db/index.js";

export const wordleRules = {
    wordle_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM wordle_scores s
                JOIN user_scores us ON s.id = us.score_id
            WHERE user_id = ? AND games_id = 9 AND attempts <= ?
        `, [userId, target])
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= 10,
            progress: progress,
            target: 10
        }
    },

    one_shot: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT MIN(w.attempts) AS min
            FROM wordle_scores w
                JOIN user_scores us ON us.score_id = w.id
            WHERE us.user_id = ? AND us.games_id = 9
        `, [userId])
        const progress = rows[0].min

        return {
            isUnlocked: progress === target,
            progress: 0,
            target: target
        }
    },

    deja_vu: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(word_target) as word_count, word_target
            FROM wordle_scores w
                JOIN user_scores us ON us.score_id = w.id
            WHERE us.user_id = ? AND us.games_id = 9 and w.found = 'Yes'
            GROUP BY word_target
            HAVING word_count >= ?
        `, [userId, target])
        const progress = rows.length

        return {
            isUnlocked: progress >= 1,
            progress: progress,
            target: 1
        }
    },

    win_streak: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT w.found
            FROM wordle_scores w
                JOIN user_scores us ON w.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 9
            ORDER BY us.played_at DESC
            LIMIT ?
        `, [userId, target]);

        let currentStreak = 0;
        for (const row of rows) {
            if (row.found === 'Yes') {
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

    clutch_save: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM wordle_scores s
                JOIN user_scores us ON s.id = us.score_id
            WHERE user_id = ? AND games_id = 9 AND attempts = 6 AND found = 'Yes'
        `, [userId])
        const progress = rows[0].total

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    }

}
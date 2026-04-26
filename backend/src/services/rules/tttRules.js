// Achievement rules for Tic-Tac-Toe
import pool from '../../db/index.js'

export const tttRules = {
    // Total games won
    ttt_wins : async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT SUM(wins) AS count
            FROM tictactoe_scores t
                JOIN user_scores u ON t.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 8 
        `, [userId]);
        const count = rows[0].count || 0;

        return {
            isUnlocked: count >= target,
            progress: count,
            target: target
        };
    },

    invincible_session_streak : async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT t.result
            FROM tictactoe_scores t
                JOIN user_scores u ON t.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 8
            ORDER BY u.played_at DESC
            LIMIT ?
        `, [userId, target]);

        let currentStreak = 0;
        for (const row of rows) {
            if (row.result !== 'LOST') {
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

    perfect_session_streak: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM tictactoe_scores t
                JOIN user_scores u ON t.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 8 
                AND t.draws = 0 AND t.losses = 0
        `, [userId]);
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        };
    }
}

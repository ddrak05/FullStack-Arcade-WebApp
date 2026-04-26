// Achievement rules for Rock Paper Scissors
import pool from '../../db/index.js'

export const rpsRules = {
    // Total Wins
    total_wins : async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS count
            FROM rockpaperscissors_scores rps
            JOIN user_scores u ON rps.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 7
                AND rps.result = 'Won' 
        `, [userId]);
        const count = rows[0].count || 0;

        return {
            isUnlocked: count >= target,
            progress: count,
            target: target
        };
    },

    // Games won in a row
    win_streak : async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT rps.result
            FROM rockpaperscissors_scores rps
                JOIN user_scores u ON rps.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 7
            ORDER BY u.played_at DESC
            LIMIT ?
        `, [userId, target]);

        let currentStreak = 0;
        for (const row of rows) {
            if (row.result === 'Won') {
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

    // Perfect game check
    perfect_game_repeat: async (target, userId) => {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM rockpaperscissors_scores rps
                JOIN user_scores u ON rps.id = u.score_id
            WHERE u.user_id = ? AND u.games_id = 7
                AND rps.draws = 0 AND rps.losses = 0 
        `, [userId])
        const progress = rows[0].total || 0;

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    }
}

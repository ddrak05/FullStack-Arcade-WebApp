// Achievement rules for Reaction Time
import pool from "../../db/index.js";

export const reactionRules = {
    // Average below target time
    time_under: async (target, user_id) => {
        const [bestScore] = await pool.query(`
            SELECT MIN(rt.average) AS average
            FROM reaction_time_scores rt
                JOIN user_scores us ON rt.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 1
        `, [user_id]);

        const bestValue = bestScore[0]?.average || 0;
        return {
            isUnlocked: bestValue > 0 && bestValue <= target,
            progress: `${bestValue}ms`,
            target: `${target}ms`
        };
    },

    // Tries below specific target
    try_condition: async (target, user_id) => {
        const [tries] = await pool.query(`
            SELECT MIN(best) AS best
            FROM user_scores us
                JOIN reaction_time_scores rt ON rt.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 1
        `, [user_id])
        const progress = tries[0].best || 0;

        return {
            isUnlocked: progress > 0 && tries[0].best <= target,
            progress: `Best: ${progress}ms`,
            target: `${target}ms`
        }
    },

    try_repeat: async (target, user_id) => {
        const [rows] = await pool.query(`
            SELECT try1, try2, try3
            FROM user_scores us
                JOIN reaction_time_scores rt ON rt.id = us.score_id
            WHERE us.user_id = ? AND us.games_id = 1
        `, [user_id])

        let progress = 0;
        for(let row of rows) {
            const tries = Object.values(row).filter(val => typeof val === 'number');
            const hits = tries.filter(t => t > 0 && t < 150).length;

            if (hits >= 2) progress++;
            if (progress >= target) break;
        }

        return {
            isUnlocked: progress >= target,
            progress: progress,
            target: target
        }
    }
}
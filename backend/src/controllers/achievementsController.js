import pool from '../db/index.js';
import {allRules} from '../services/achievementRules.js'
import {storeXP} from "../services/storeXP.js";
import {checkAvatarUnlock} from "../services/avatarUnlock.js";

export async function getAchievements(req, res) {
    const user_id = req.user.id;
    try {
        const [rows] = await pool.query(`
            SELECT a.*, ua.unlocked_at AS unlocked_at  
            FROM achievements a
                LEFT JOIN user_achievements ua
                    ON a.id = ua.achievement_id AND ua.user_id = ?
                    
        `, [user_id])
        const games_id = [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

        let allProgress = {};
        for (const g_id of games_id) {
            const result = await checkAchievements(user_id, g_id);

            if (result && result.progress) {
                allProgress = { ...allProgress, ...result.progress };
            }
        }

        res.status(200).json({
            rows: rows,
            progress: allProgress,
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({error: err.message});
    }
}

export async function checkAchievements (user_id, games_id){
    try{
        // 1. Find all not unlocked achievements for this game / general
        const [achievements] = await pool.query(`
            SELECT * 
            FROM achievements
            WHERE (games_id = ? OR games_id IS NULL)
                AND id NOT IN (
                    SELECT achievement_id 
                    FROM user_achievements
                    WHERE user_id = ?
                )
        `, [games_id, user_id])

        const unlocked = [];
        const progress = {};

        // 2. Loop through each achievement and check the rules
        for (const ach of achievements) {
            const rule = allRules[ach.requirement_type]
            if (!rule) continue;

            // 3. if rule is met, unlock achievement
            const status = await rule(ach.requirement_value, user_id, ach.games_id)
            if(status.isUnlocked) {
                await pool.query(`
                    INSERT INTO user_achievements (user_id, achievement_id)
                    VALUES (?, ?)
                `, [user_id, ach.id])
                unlocked.push(ach);

                // Check if avatar has been unlocked
                if (ach.tier === 'Gold')
                    await checkAvatarUnlock(user_id, ach.name)

                // 4. Update user's global XP
                await storeXP(user_id, ach.xp_reward, 'achievement', ach.id)
            } else if (rule && !status.isUnlocked) {
                progress[ach.id] = `(${status.progress}/${status.target})`
            }
        }

        return {
            unlocked,
            progress
        };
    } catch(err) {
        console.error(err);
        return [];
    }
}
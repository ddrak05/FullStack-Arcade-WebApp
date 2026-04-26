import pool from '../db/index.js'

export async function checkAvatarUnlock (user_id, achievement_name) {
    try {
        const [avatar] = await pool.query(`
            SELECT id FROM avatars WHERE achievement_name = ?
        `, [achievement_name])

        if (avatar.length > 0) {
            await pool.query(`
                INSERT IGNORE INTO user_avatars (user_id, avatar_id) 
                VALUES (?, ?)
            `, [user_id, avatar[0].id])
        }
    } catch (err) {
        console.error("Error Unlocking Avatar", err)
    }
}
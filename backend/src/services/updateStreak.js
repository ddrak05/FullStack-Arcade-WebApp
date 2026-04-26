import pool from '../db/index.js'

export async function updateStreak(user_id) {
    await pool.query(`
        UPDATE users
        SET 
            streak = CASE
                WHEN last_joined = CURDATE() THEN streak
                WHEN last_joined = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN streak + 1 
                ELSE 1
            END, 
            last_joined = CURDATE()
        WHERE id = ?
    `, [user_id])
}
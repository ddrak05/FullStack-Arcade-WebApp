import pool from '../db/index.js';

export async function storeXP(user_id, amount, source, ref_id) {
    await pool.query(`
        INSERT INTO user_xp (user_id, amount, source, reference_id)
        VALUES (?, ?, ?, ?)
    `, [user_id, amount, source, ref_id]);

    await pool.query(`
        UPDATE users SET xp = xp + ? WHERE id = ?
    `, [amount, user_id])
}
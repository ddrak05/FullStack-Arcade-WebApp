import pool from '../db/index.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Avatars
export async function getAvatars (req, res) {
    const userId = req.user.id;

    try {
        // Insert free avatars
        await pool.query(`
            INSERT IGNORE INTO user_avatars (user_id, avatar_id)
            SELECT ?, id FROM avatars WHERE is_free = 1
        `, [userId]);

        // Get Avatars
        const [avatars] = await pool.query(`
            SELECT a.id, a.icon, a.is_free, a.achievement_name, ua.unlocked_at,
                CASE 
                    WHEN ua.user_id IS NOT NULL THEN 1
                    ELSE 0
                END AS is_unlocked
            FROM avatars a
                LEFT JOIN user_avatars ua
                    ON a.id = ua.avatar_id AND ua.user_id = ?
            ORDER BY a.is_free DESC, a.id ASC
        `, [userId])

        res.json(avatars);
    } catch (err) {
        console.log(err)
        res.status(500).send(err.message);
    }
}

export async function updateAvatar (req, res) {
    const {avatar} = req.body;
    const userId = req.user.id;

    if(!avatar) {
        return res.status(400).json({message: "No Avatar Selected"})
    }

    try {
        const [result] = await pool.query(
            'UPDATE users SET avatar = ? WHERE id = ?',
            [avatar, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Avatar updated successfully" });
    } catch(err) {
        res.status(500).json({message: 'Server Error'})
    }
}

// Toggle Visibility
export async function toggleVisibility (req, res) {
    const {isPublic} = req.body;
    const userId = req.user.id;

    try {
        await pool.query(`
            UPDATE users SET is_public = ? WHERE id = ?
        `, [isPublic, userId]);
        res.status(200).json({message: 'Visibility Updated'})
    } catch (err) {
        res.status(500).json({message: "Failed to Update Visibility Settings"})
    }
}

// Update Username
export async function updateUsername (req, res) {
    const {newUsername} = req.body;
    const userId = req.user.id;

    if (!newUsername || newUsername.length < 3) {
        return res.status(400).json({message: 'Username must be at least 3 characters longs'})
    }

    try {
        const [usernameExists] = await pool.query(`
            SELECT id FROM users WHERE username = ?
        `, [newUsername])

        if (usernameExists.length > 0) {
            return res.status(400).json({message: 'Username already exists'})
        }

        await pool.query(`
            UPDATE users SET username = ? WHERE id = ?
        `, [newUsername, userId])

        const newToken = jwt.sign(
            { id: userId, username: newUsername }, // Payload matches your Login payload
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Username updated successfully',
            token: newToken
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Username update failed'})
    }
}

// Update Password
export async function updatePassword (req, res) {
    const {oldPassword, newPassword} = req.body;
    const userId = req.user.id;

    try {
        // Verify old Password
        const [rows] = await pool.query(` 
            SELECT password FROM users WHERE id = ?
        `, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Old password is incorrect' });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                message: 'New password cannot be the same as your current password!'
            });
        }

        // Verify new Password
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
        if (!newPassword || !passwordRegex.test(newPassword)) {
            return res.status(400).json({
                message: 'New password must be at least 8 characters long and include at least one letter and one number!'
            });
        }

        // Hash new password and Update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query(`
            UPDATE users SET password = ? WHERE id = ?
        `, [hashedPassword, userId])

        res.status(200).json({
            message: 'Password updated successfully',
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Password update failed'})
    }
}

export async function deleteAccount (req, res) {
    const userId = req.user.id;
    try {
        const [result] = await pool.query(`
            DELETE FROM users WHERE id = ?
        `, [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Account deleted permanently" });
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Failed to delete account'})
    }
}
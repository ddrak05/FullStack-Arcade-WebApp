import pool from "../db/index.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {storeXP} from "../services/storeXP.js";
import {updateStreak} from "../services/updateStreak.js";

export async function register(req, res) {
    const {username, email, password} = req.body;

    // Username Validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/
    if (!username || !usernameRegex.test(username)) {
        return res.status(400).json({
            message: 'Username must be 3-15 characters and contain only letters, numbers or underscores!'
        })
    }

    // Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({
            message: 'Please provide a valid email address!'
        })
    }

    // Password Validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!password || !passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Password must be at least 8 characters long and include at least one letter and one number!'
        })
    }

    try {
        const [emailExists] = await pool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        const [usernameExists] = await pool.query(
            `SELECT * FROM users WHERE username = ?`,
            [username]
        )

        if (emailExists.length > 0) {
            return res.status(400).json({message: "Email already exists"});
        }

        if(usernameExists.length > 0) {
            return res.status(400).json({message: "Username already exists"});
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save to DB
        const [user] = await pool.query(
            `INSERT INTO users (username, email, password)
             VALUES (?, ?, ?)`,
            [username, email, hashedPassword]
        );
        const userId = user.insertId;

        // Give the signup achievement
        await pool.query(`
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (?, 1)
        `, [userId])

        // Add XP to new user and store award
        await storeXP(userId, 10, 'achievement', 1);

        res.status(200).json({message: "Successfully registered"});
    } catch (err) {
        res.status(500).json({message: "Internal Server Error", error: err.message});
    }
}

export async function login(req, res) {
    const {email, password} = req.body;

    try{
        // Find user
        const [rows] = await pool.query(
            `SELECT * FROM users WHERE email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({message: "Invalid Email"});
        }

        const user = rows[0];

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({message: "Invalid Password"});
        }

        // Create JWT Token
        const token = jwt.sign(
            {id: user.id, username: user.username},
            process.env.JWT_SECRET, {expiresIn: "1h"}
        );

        // Update Streak
        await updateStreak(user.id)

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar: user.avatar,
                xp: user.xp,
                streak: user.streak,
                is_public: user.is_public,
                last_joined: user.last_joined
            }
        })
    }catch (err){
        res.status(500).json({message: "Internal Server Error", error: err.message});
    }
}

export async function refreshToken (req, res) {
    try {
        // Refresh Token timer
        const userId = req.user.id;
        const userUsername = req.user.username;

        const newToken = jwt.sign(
            {id: userId, username: userUsername},
            process.env.JWT_SECRET, {expiresIn: "1h"}
        )

        res.status(200).json({
            success: true,
            newToken: newToken
        })
    } catch (err) {
        console.log(err)
        res.status(500).json({message: "Could not refresh token"})
    }
}
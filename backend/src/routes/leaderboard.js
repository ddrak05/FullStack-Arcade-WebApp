import express from 'express';
import {
    getTopUsers,
    getGameLeaderboard,
    getXpByPeriod
} from "../controllers/leaderboardController.js";
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();
router.get('/top-users', authenticateToken, getTopUsers);
router.get('/xp-leaderboard', authenticateToken, getXpByPeriod);
router.get('/game-leaderboard', authenticateToken, getGameLeaderboard);

export default router;
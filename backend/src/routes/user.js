import express from 'express';
import {
    getUserStats,
    getRecentAchievements,
    getUserBestScores,
    getRecentGames,
    getUserInfo
} from "../controllers/userController.js";
import {getComparisonData} from "../controllers/compareController.js";
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();
router.get('/info', authenticateToken, getUserInfo);
router.get('/recent-achievements', authenticateToken, getRecentAchievements);
router.get('/stats', authenticateToken, getUserStats);
router.get('/best', authenticateToken, getUserBestScores);
router.get('/recent-games', authenticateToken, getRecentGames);
router.get('/compare/:username', authenticateToken, getComparisonData);

export default router;
import express from 'express';
import {
    getAchievements
} from "../controllers/achievementsController.js";
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();
router.get('/fetch', authenticateToken, getAchievements);

export default router;
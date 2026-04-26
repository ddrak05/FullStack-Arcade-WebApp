import express from 'express';
import {getGames} from '../controllers/gamesController.js';
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();
router.get('/', authenticateToken, getGames);

export default router;
import express from 'express';
import {
    saveReactionTimeScore,
    saveSequenceScore,
    saveNumberScore,
    saveVerbalScore,
    saveVisualScore,
    saveTypingScore,
    saveRockPaperScissorsScore,
    saveTicTacToeScore,
    saveWordleScore,
    saveMathScore
} from "../controllers/scoresController.js";
import {authenticateToken} from "../middleware/auth.js";

const router = express.Router();
router.post('/reaction-time', authenticateToken, saveReactionTimeScore)
router.post('/sequence-memory', authenticateToken, saveSequenceScore)
router.post('/verbal-memory', authenticateToken, saveVerbalScore);
router.post('/number-memory', authenticateToken, saveNumberScore);
router.post('/visual-memory', authenticateToken, saveVisualScore);
router.post('/typing-speed', authenticateToken, saveTypingScore);
router.post('/rock-paper-scissors', authenticateToken, saveRockPaperScissorsScore)
router.post('/tic-tac-toe', authenticateToken, saveTicTacToeScore);
router.post('/wordle', authenticateToken, saveWordleScore)
router.post('/quick-maths', authenticateToken, saveMathScore)

export default router;
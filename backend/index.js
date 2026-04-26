import express from "express";
import cors from "cors";

import authRoutes from "./src/routes/auth.js";
import gamesRoutes from "./src/routes/games.js";
import scoresRoutes from "./src/routes/scores.js";
import achievementRoutes from './src/routes/achievements.js';
import leaderboardRoutes from "./src/routes/leaderboard.js";
import userRoutes from "./src/routes/user.js";
import settingsRoutes from "./src/routes/settings.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({message: 'Arcade is running'});
})

app.use('/api/auth', authRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/user', userRoutes);
app.use('/api/settings', settingsRoutes)

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})
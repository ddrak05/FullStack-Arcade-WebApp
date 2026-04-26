import pool from '../db/index.js';
import {checkAchievements} from "./achievementsController.js";
import {storeXP} from '../services/storeXP.js';

export async function saveReactionTimeScore(req,  res) {
    const user_id = req.user.id;
    const {try1, try2, try3, multiplier} = req.body;
    const best = Math.min(try1, try2, try3);
    const average = Math.round((try1 + try2 + try3) / 3);

    try{
        // Insert into reaction_time_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO reaction_time_scores (try1, try2, try3, best, average) 
            VALUES (?, ?, ?, ?, ?)`,
            [try1, try2, try3, best, average]
        );
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            average > 500 ? Math.round(5000 / average) :
                average > 400 ? Math.round(10000 / average) :
                    average > 300 ? Math.round(20000 / average) :
                        average > 200 ? Math.round (35000 / average) :
                            Math.round (50000 / average)
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 1, scoreId, final_xp]
        );

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 1)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 1)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch(err) {
        console.log(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Sequence Memory Score
export async function saveSequenceScore(req,  res) {
    const user_id = req.user.id;
    const {level_reached, sequence, multiplier} = req.body;

    try {
        // Insert into sequence_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO sequence_scores (level_reached, sequence)
             VALUES (?, ?)`,
            [level_reached, JSON.stringify(sequence)]
        )
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            level_reached <= 3 ? level_reached :
                level_reached <= 5 ? level_reached * 2 :
                    level_reached < 10 ? level_reached * 5 :
                        level_reached < 15 ? level_reached * 8 :
                            level_reached < 25 ? level_reached * 10 :
                                level_reached < 50 ? level_reached * 20 :
                                    level_reached * 30
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
             VALUES (?, ?, ?, ?)`,
            [user_id, 2, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 2)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 2)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch(err) {
        console.log(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Number Memory Score
export async function saveNumberScore(req,  res) {
    const user_id = req.user.id;
    const {level_reached, number_fail, multiplier} = req.body;

    try{
        // Insert into number_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO number_scores (level_reached, number_fail)
            VALUES (?, ?)`,
            [level_reached, number_fail]
        )
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            level_reached <= 3 ? level_reached * 2 :
                level_reached <= 5 ? level_reached * 7 :
                    level_reached <= 7 ? level_reached * 14 :
                        level_reached <= 9 ? level_reached * 16 :
                            level_reached <= 12 ? level_reached * 22 :
                                level_reached * 30
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 3, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 3)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 3)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Verbal Memory Score
export async function saveVerbalScore(req, res) {
    const user_id = req.user.id;
    const {score, multiplier} = req.body;

    try{
        // Insert into verbal_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO verbal_scores (score)
            VALUES (?)`,
            [score]
        )
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            score <= 3 ? score :
                score <= 7 ? score * 2 :
                    score <= 12 ? score * 4 :
                        score <= 15 ? score * 6 :
                            score <= 20 ? score * 8 :
                                score <= 40 ? score * 10 :
                                    score <= 60 ? score * 15 :
                                        score * 20
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 4, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 4)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 4)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    }catch (err) {
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

export async function saveVisualScore(req, res) {
    const user_id = req.user.id;
    const {level_reached, max_grid_size, multiplier} = req.body;

    try{
        // Insert into visual_scores and get new id
        const [result] = await pool.query(`
            INSERT INTO visual_scores (level_reached, max_grid_size)
            VALUES (?, ?)`,
            [level_reached, max_grid_size]
        )
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            max_grid_size <= 3 ? level_reached * 2 :
                max_grid_size <= 4 ? level_reached * 4 :
                    max_grid_size <= 5 ? level_reached * 5 :
                        max_grid_size <= 6 ? level_reached * 6 :
                            max_grid_size <= 7 ? level_reached * 10 :
                                level_reached * 12
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert to user_scores
        await pool.query(`
            INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 5, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 5)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 5)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    }catch(err) {
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Typing Speed Score
export async function saveTypingScore(req, res) {
    const user_id = req.user.id;
    const {words_typed, wpm, accuracy, multiplier} = req.body;

    try {
        // Insert into typing_speed_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO typing_speed_scores(words_typed, wpm, accuracy)
             VALUES (?, ?, ?)`,
            [words_typed, wpm, accuracy]
        )
        const scoreId = result.insertId;

        // Calculate XP earned
        const xp_earned =
            wpm <= 30 ? Math.round(wpm) :
                wpm <= 50 ? Math.round((accuracy * wpm) / 130) :
                    wpm <= 60 ? Math.round ((accuracy * wpm) / 75) :
                        wpm <= 75 ? Math.round ((accuracy * wpm) / 65) :
                            wpm <= 90 ? Math.round ((accuracy * wpm) / 35) :
                                Math.round((accuracy * wpm) / 30)
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(`
                    INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
                    VALUES (?, ?, ?, ?)`,
            [user_id, 6, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 6)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 6)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Rock-Paper-Scissors Score
export async function saveRockPaperScissorsScore(req, res) {
    const user_id = req.user.id;
    const {wins, draws, losses, outcome, multiplier} = req.body;
    const games_played = wins + draws + losses;

    try{
        // Insert into rockPaperScissors_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO rockpaperscissors_scores (played, wins, draws, losses, result)
            VALUES (?, ?, ?, ?, ?)`,
            [games_played, wins, draws, losses, outcome]
        )
        const scoreId = result.insertId;

        // Calculate XP
        const xp_earned =
            outcome === 'Won' ? (20 * wins) - (5 * draws) - (5 * losses) :
                Math.max((10 * wins) + (3 * draws) - (5 * losses), 0)
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 7, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 7)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 7)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Tic-Tac-Toe Score
export async function saveTicTacToeScore(req,  res) {
    const user_id = req.user.id;
    const {wins, draws, losses, multiplier} = req.body;
    const played = wins + draws + losses;
    const outcome =
        wins === losses ? 'DREW' :
            wins > losses ? 'WON' : 'LOST';

    try{
        // Insert into tictactoe_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO tictactoe_scores (played, wins, draws, losses, result)
            VALUES (?, ?, ?, ?, ?)`,
            [played, wins, draws, losses, outcome]
        )
        const scoreId = result.insertId;

        // Calculate XP
        const xp_earned =
            outcome === 'WON' ? (20 * wins) - (2 * draws) - (5 * losses) :
                Math.max((10 * wins) + (3 * draws) - (5 * losses), 0)

        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 8, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 8)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 8)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Wordle Score
export async function saveWordleScore(req, res) {
    const user_id = req.user.id;
    const {word, attempts, found, multiplier} = req.body;
    const isFound = found ? 'Yes' : 'No'

    try{
        // Insert into wordle_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO wordle_scores (attempts, found, word_target)
            VALUES (?, ?, ?)`,
            [attempts, isFound, word]
        )
        const scoreId = result.insertId;

        // Calculate XP
        const xp_earned =
            isFound ? Math.round(300 + (1000 / attempts))
                : Math.round(200 / attempts)

        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 9, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 9)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 9)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        console.log(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}

// Quick Maths Score
export async function saveMathScore(req, res) {
    const user_id = req.user.id;
    const {score, total, avg_response_time, accuracy, multiplier} = req.body;

    try{
        // Insert into quick_math_scores and get new id
        const [result] = await pool.query(
            `INSERT INTO quick_math_scores (score, total, avg_response_time, accuracy)
            VALUES (?, ?, ?, ?)`,
            [score, total, avg_response_time, accuracy]
        )
        const scoreId = result.insertId;

        const speedFactor = 2.0 / Math.max(avg_response_time, 0.5);
        const xp_earned =
            accuracy === 100 ? Math.round(score * 15 * speedFactor)
                : accuracy >= 90 ? Math.round(score * 12 * speedFactor)
                    : accuracy >= 75 ? Math.round(score * 10 * speedFactor)
                        : accuracy >= 40 ? Math.round(score * 8 * speedFactor)
                            : Math.round(score * 5);
        const final_xp = Math.floor(xp_earned * multiplier);

        // Insert into user_scores
        await pool.query(
            `INSERT INTO user_scores (user_id, games_id, score_id, xp_earned)
            VALUES (?, ?, ?, ?)`,
            [user_id, 10, scoreId, final_xp]
        )

        // Add XP to user's total and store xp reward
        await storeXP(user_id, final_xp, 'game', 10)

        // Check if any achievement has been unlocked
        const gameAchievements = await checkAchievements(user_id, 10)
        const generalAchievements = await checkAchievements(user_id, null);

        const achievementUnlocked = [
            ...(gameAchievements.unlocked || []),
            ...(generalAchievements.unlocked || [])
        ];
        res.status(200).json({final_xp, achievementUnlocked})
    } catch (err) {
        console.error(err)
        res.status(500).json({message: 'Error Saving Scores', error: err.message});
    }
}
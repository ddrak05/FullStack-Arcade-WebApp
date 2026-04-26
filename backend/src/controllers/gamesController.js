import pool from '../db/index.js';

export async function getGames(req, res) {
    try{
        const user_id = req.user.id;

        const [games] = await pool.query(`
            SELECT g.*, COALESCE(SUM(us.xp_earned), 0) AS xp,
                (SELECT COUNT(*) FROM achievements WHERE games_id = g.id) AS total,
                (SELECT COUNT(*) FROM user_achievements ua 
                    JOIN achievements a ON ua.achievement_id = a.id
                    WHERE a.games_id = g.id AND ua.user_id = ?) AS unlocked
            FROM games g
                LEFT JOIN user_scores us ON us.games_id = g.id AND us.user_id = ?
            GROUP BY g.id
            `, [user_id, user_id]
        );
        res.json(games);
    } catch(err) {
        res.status(500).json({message: 'Server Error', error: err.message})
    }
}
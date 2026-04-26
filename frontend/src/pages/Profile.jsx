import {useState, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx';
import {getLevel} from '../utils/levelLogic.js';
import '../styles/profile.css';

export default function Profile() {
    const {token, user, refreshToken} = useAuth();
    const navigate = useNavigate();
    const {username} = useParams();
    const isOwnProfile = !username || username === user.username;

    const [loading, setLoading] = useState(false);
    const [period, setPeriod] = useState('all-time');
    const [personalBest, setPersonalBest] = useState(null);
    const [personalStats, setPersonalStats] = useState(null);
    const [recentGames, setRecentGames] = useState(null);
    const [games, setGames] = useState([]);
    const [selectedGame, setSelectedGame] = useState('Reaction Time');
    const [lastAchievements, setLastAchievements] = useState([]);

    useEffect(() => {
        fetchPersonal(period);
    }, [period, username]);

    useEffect(() => {
        fetchGames();
    }, [])

    useEffect(() => {
        fetchAchievements()
    }, [])

    const fetchPersonal = async (period) => {
        setLoading(true);
        try {
            const userParam = username ? `&username=${username}` : '';

            const [bestResult, statsResult, recentResult] = await Promise.all([
                fetch(`http://localhost:3000/api/user/best?period=${period}${userParam}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                }),
                fetch(`http://localhost:3000/api/user/stats${username ? `?username=${username}` : ''}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                }),
                fetch(`http://localhost:3000/api/user/recent-games${username ? `?username=${username}` : ''}`, {
                    headers: {'Authorization': `Bearer ${token}`}
                })
            ]);

            const best = await bestResult.json();
            const stats = await statsResult.json();
            stats.user_stats.level = getLevel(stats.user_stats.xp)
            const recent = await recentResult.json();

            setPersonalBest(best);
            setPersonalStats(stats);
            setRecentGames(recent);
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    // Fetch last 5 achievements unlocked
    async function fetchAchievements() {
        try{
            refreshToken()
            setLoading(true);
            const response = await fetch(`http://localhost:3000/api/user/recent-achievements${username ? `?username=${username}` : ''}`, {
                headers: {'Authorization': `Bearer ${token}`}
            });
            const data = await response.json();
            const fetchedAchievements = data?.achievements || [];

            const padded = [...fetchedAchievements];
            while (padded.length < 5) {
                padded.push(null);
            }
            setLastAchievements(padded)
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    // Fetch games
    async function fetchGames() {
        try {
            const response = await fetch('http://localhost:3000/api/games', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setGames(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // XP by game
    const getGameXp = (gameId) => {
        if(!personalBest.xpByGame) return 0;
        const found = personalBest.xpByGame.find(x => x.games_id === Number(gameId));
        return found ? found.xp : 0;
    }

    const renderScores = () => {
        if (!personalBest) return null;

        const noData = (cols) => (
            <tr>
                <td colSpan={cols} className='no-data'>No Scores Yet!</td>
            </tr>
        )

        switch (selectedGame) {
            // Reaction Time
            case games[0].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Average</th>
                                <th>Best</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.reaction.length > 0 ?  personalBest.reaction.map((r, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{r.average}ms</td>
                                    <td className='green'>{r.best}ms</td>
                                    <td className='green'>+{r.xp_earned}</td>
                                    <td className='date'>{new Date(r.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(5)}
                        </tbody>
                    </table>
                );

            // Sequence Memory
            case games[1].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Level</th>
                                <th>Sequence</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.sequence.length > 0 ?  personalBest.sequence.map((s, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{s.level_reached}</td>
                                    <td>{s.sequence}</td>
                                    <td className='green'>+{s.xp_earned}</td>
                                    <td className='date'>{new Date(s.played_at).toLocaleDateString()}</td>
                                </tr>
                                )) : noData(5)}
                        </tbody>
                    </table>
                );

            // Number Memory
            case games[2].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Level</th>
                                <th>Failed At</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.number.length > 0 ?  personalBest.number.map((n, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{n.level_reached}</td>
                                    <td className='red'>{n.number_fail}</td>
                                    <td className='green'>+{n.xp_earned}</td>
                                    <td className='date'>{new Date(n.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(5)}
                        </tbody>
                    </table>
                );

            // Verbal Memory
            case games[3].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Score</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.verbal.length > 0 ?  personalBest.verbal.map((v, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{v.score}</td>
                                    <td className='green'>+{v.xp_earned}</td>
                                    <td className='date'>{new Date(v.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(4)}
                        </tbody>
                    </table>
                );

            // Visual Memory
            case games[4].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Level</th>
                                <th>Grid</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.visual.length > 0 ?  personalBest.visual.map((v, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{v.level_reached}</td>
                                    <td>{v.max_grid_size}X{v.max_grid_size}</td>
                                    <td className='green'>+{v.xp_earned}</td>
                                    <td className='date'>{new Date(v.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(5)}
                        </tbody>
                    </table>
                );

            // Typing Speed
            case games[5].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>WPM</th>
                                <th>Words Typed</th>
                                <th>Accuracy</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.typing.length > 0 ?  personalBest.typing.map((t, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td className='blue'>{t.wpm}WPM</td>
                                    <td>{t.words_typed}</td>
                                    <td className='green'>{t.accuracy}%</td>
                                    <td className='green'>+{t.xp_earned}</td>
                                    <td className='date'>{new Date(t.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(6)}
                        </tbody>
                    </table>
                );

            // Rock Paper Scissors
            case games[6].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Played</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Result</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.rps.length > 0 ?  personalBest.rps.map((r, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td>{r.played}</td>
                                    <td className='blue'>{r.wins}</td>
                                    <td>{r.losses}</td>
                                    <td className='green'>{r.result}</td>
                                    <td className='green'>+{r.xp_earned}</td>
                                    <td className='date'>{new Date(r.played_at).toLocaleDateString()}</td>
                                </tr>
                                )) : noData(7)}
                        </tbody>
                    </table>
                );

            // Tic-Tac-Toe
            case games[7].name:
                return (
                    <table className='scores-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Played</th>
                                <th>Wins</th>
                                <th>Losses</th>
                                <th>Result</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {personalBest.tictactoe.length > 0 ?  personalBest.tictactoe.map((t, i) => (
                                <tr key={i}>
                                    <td className='rank'>{i + 1}</td>
                                    <td>{t.played}</td>
                                    <td className='blue'>{t.wins}</td>
                                    <td>{t.losses}</td>
                                    <td className='green'>{t.result}</td>
                                    <td className='green'>+{t.xp_earned}</td>
                                    <td className='date'>{new Date(t.played_at).toLocaleDateString()}</td>
                                </tr>
                            )) : noData(7)}
                        </tbody>
                    </table>
                );

            // Wordle
            case games[8].name:
                return (
                    <table className='scores-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Attempts</th>
                            <th>Found</th>
                            <th>Word</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personalBest.wordle.length > 0 ?  personalBest.wordle.map((w, i) => (
                            <tr key={i}>
                                <td className='rank'>{i + 1}</td>
                                <td className='blue'>{w.attempts}</td>
                                <td className={`${w.found === 'Yes' ? 'green' : 'red'}`}>{w.found}</td>
                                <td>{w.word_target}</td>
                                <td className='green'>+{w.xp_earned}</td>
                                <td className='date'>{new Date(w.played_at).toLocaleDateString()}</td>
                            </tr>
                        )) : noData(6)}
                        </tbody>
                    </table>
                );

            // Quick Maths
            case games[9].name:
                return (
                    <table className='scores-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Score</th>
                            <th>Total</th>
                            <th>Accuracy</th>
                            <th>Time Per Correct Answer</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personalBest.maths.length > 0 ?  personalBest.maths.map((m, i) => (
                            <tr key={i}>
                                <td className='rank'>{i + 1}</td>
                                <td className='green'>{m.score}</td>
                                <td className='blue'>{m.total}</td>
                                <td className={`${m.accuracy >= 80 ? 'green' : 'red'}`}>{m.accuracy}%</td>
                                <td className='blue'>{m.avg_response_time}s</td>
                                <td className='green'>+{m.xp_earned}</td>
                                <td className='date'>{new Date(m.played_at).toLocaleDateString()}</td>
                            </tr>
                        )) : noData(6)}
                        </tbody>
                    </table>
                );
        }
    }

    return (
        <div className="pp-page">
            <div className='pp-header'>
                <button className='back' onClick={() => navigate(-1)}>Back</button>

                {!isOwnProfile && (
                    <div className='other-profile'>
                        <h2 className='pp-viewing'>Viewing {username}'s Profile</h2>
                        {personalStats?.user_stats?.is_public === 1 && <button className='compare' onClick={() => navigate(`/profile/${username}/compare`)}>Compare</button>}
                    </div>
                )}
            </div>

            {loading && <p className='pp-loading'>Loading ... </p> }

            {!loading && personalStats && (
                <div className='pp-content'>
                    {/* User Card */}
                    <div className='pp-card'>
                        <div className='user-info'>
                            <span className='user-avatar'>{personalStats.user_stats.avatar}</span>
                            <div>
                                <h2 className='user-name'>
                                    {personalStats.user_stats.username}
                                    {!isOwnProfile && personalStats.user_stats.is_public === 0 && '🔒'}
                                </h2>
                                <span className='user-rank'>Rank #{personalStats.user_stats.player_rank}</span>
                            </div>
                        </div>
                        <div className='user-stats'>
                            <div className='user-stats-top'>
                                <div className='stat-box'>
                                    <span className='stat-label'>Level</span>
                                    <span className='stat-value blue'>{personalStats.user_stats.level}</span>
                                </div>
                                <div className='stat-box'>
                                    <span className='stat-label'>Total XP</span>
                                    <span className='stat-value green'>{personalStats.user_stats.xp}</span>
                                </div>
                                <div className='stat-box'>
                                    <span className='stat-label'>Games Played</span>
                                    <span className='stat-value'>{personalStats.games_played}</span>
                                </div>
                            </div>
                            <div className='user-stats-bottom'>
                                <div className='stat-box wide'>
                                    <span className='stat-label'>Favorite Game</span>
                                    <span className='stat-value bottom'>
                                    {personalStats.favorite.name ? `${personalStats.favorite.name} (${personalStats.favorite.count} games)` : '-' }                                    </span>
                                </div>
                                <div className='stat-box wide show' data-title={`${(1 + personalStats.user_stats.streak * 0.1).toFixed(1)} Multiplier`}>
                                    <span className='stat-label'>Streak</span>
                                    <span className='stat-value bottom'>
                                        🔥 {personalStats.user_stats.streak || 0} Days
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isOwnProfile && personalStats.user_stats.is_public === 0 ? (
                        <div className='pp-card private-notice'>
                            <div className='private-content'>
                                <span className='private-icon'>🕵️</span>
                                <h3>This Profile is Private</h3>
                                <p>You cannot view {personalStats.user_stats.username}'s full stats and achievements currently</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Last 5 achievements */}
                            <div className='pp-card'>
                                <h3 className='card-title'>✨ Last Achievements</h3>
                                <div className='recent-achievements-grid'>
                                    {lastAchievements.map((ach, i) => (
                                        <div key={i}
                                             className='achievement-slot'
                                             data-tooltip={ach ? `${ach.description}` : ''}
                                        >
                                            {ach ? (
                                                <>
                                                    <span className='ach-emoji'>{ach.emoji}</span>
                                                    <span className='ach-name'>{ach.name}</span>
                                                    <span className='ach-earned'>{new Date(ach.unlocked_at).toLocaleDateString()}</span>
                                                </>
                                            ) : (
                                                <span></span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Games */}
                            <div className='pp-card'>
                                <h3 className='card-title recent'>🕹️ Recent Games</h3>
                                <div className='recent-games-area'>
                                    <table className='scores-table'>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Game</th>
                                                <th>Summary</th>
                                                <th>XP</th>
                                                <th>Played At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentGames?.length > 0
                                                ? recentGames?.map((r, i) => (
                                                    <tr key={i}>
                                                        <td className='rank'>{i + 1}</td>
                                                        <td>
                                                            <span className='recent-name'>{r.emoji} {r.game}</span>
                                                        </td>
                                                        <td className='recent-summary'>{r.summary}</td>
                                                        <td className='green'>+{r.xp_earned}XP</td>
                                                        <td className='date'>{new Date(r.played_at).toLocaleDateString()}</td>
                                                    </tr>
                                                ))
                                                :   <tr>
                                                        <td colSpan={4} className='no-date'>No games played yet!</td>
                                                    </tr>
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Game Selector */}
                            <div className='pp-card'>
                                <div className='pp-title'>
                                    <h3 className='card-title'>🏆 Personal Best</h3>
                                    <div className='card-period'>
                                        {['daily', 'weekly', 'monthly', 'all-time'].map(p => (
                                            <button
                                                key={p}
                                                className={`period-btn ${period === p ? 'active' : ''}`}
                                                onClick={() => {setPeriod(p)}}
                                            >
                                                {p === 'daily' ? 'Daily' :
                                                    p === 'weekly' ? 'Weekly' :
                                                        p === 'monthly' ? 'Monthly' :
                                                            'All Time'
                                                }
                                             </button>
                                        ))}
                                    </div>
                                </div>

                                <div className='game-selector'>
                                    {games.map(game => (
                                        <button
                                            key={game.name}
                                            className={`game-btn ${selectedGame === game.name ? 'active' : ''}`}
                                            onClick={() => setSelectedGame(game.name)}
                                        >
                                            <span>{game.emoji}</span>
                                            <div className='game-btn-text'>
                                                <span>{game.name}</span>
                                                <span className='game-btn-xp'>+{getGameXp(game.id)}XP</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <div className='scores-table-area'>
                                    {renderScores()}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
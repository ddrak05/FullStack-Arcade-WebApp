import {useState, useEffect} from 'react';
import {useNavigate} from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx';
import {getLevel} from "../utils/levelLogic.js";
import '../styles/leaderboard.css';

export default function Leaderboard() {
    const {token, user} = useAuth();
    const navigate = useNavigate();

    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState('Reaction Time');

    // Top User's By XP (Leaderboard 1)
    const [totalUsers, setTotalUsers] = useState(0);
    const [topUserData, setTopUserData] = useState([]);
    const [topCurrentUser, setTopCurrentUser] = useState(null);

    // XP by Period (Leaderboard 2)
    const [xpPeriod, setXpPeriod] = useState('alltime');
    const [xpPeriodData, setXpPeriodData] = useState([]);
    const [xpCurrentUser, setXpCurrentUser] = useState(null);

    // Top User's Per Game (Leaderboard 3)
    const [gameData, setGameData] = useState([]);
    const [gamePeriod, setGamePeriod] = useState('alltime')


    useEffect(() => {
        fetchGames();
        fetchTopUsers();
    }, [])

    useEffect(() => {
        fetchXpLeaderboard(xpPeriod);
    }, [xpPeriod])

    useEffect(() => {
        fetchGameLeaderboard(gamePeriod);
    }, [gamePeriod, selectedGame])

    // Top User's By XP (Leaderboard 1)
    const fetchTopUsers = async () => {
        setLoading(true);
        try{
            const response = await fetch('http://localhost:3000/api/leaderboard/top-users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            data.rows = data.rows.map(p => ({
                ...p, level: getLevel(p.xp)
            }))

            if (data.currentUser) {
                data.currentUser = data.currentUser.map(c => ({
                    ...c, level: getLevel(c.xp)
                }))
            }

            setTopUserData(data.rows);
            setTopCurrentUser(data.currentUser);
            setTotalUsers(data.total);
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    // XP by Period (Leaderboard 2)
    const fetchXpLeaderboard = async (period) => {
        setLoading(true);
        try{
            const response = await fetch(`http://localhost:3000/api/leaderboard/xp-leaderboard?period=${period}`, {
                headers: {'Authorization': `Bearer ${token}`}
            })
            const data = await response.json();
            const rowsWithLevels = data.rows.map(p => ({
                ...p, level: getLevel(p.xp)
            }));

            let userWithLevel = null;
            if (data.currentUser) {
                userWithLevel = {
                    ...data.currentUser,
                    level: getLevel(data.currentUser.xp)
                };
            }

            setXpPeriodData(rowsWithLevels);
            setXpCurrentUser(userWithLevel);
        }catch(err){
            console.error(err);
        }finally{
            setLoading(false);
        }
    }

    // Top users per game Leaderboard (3)
    const fetchGameLeaderboard = async (period) => {
        setLoading(true);
        try{
            const response = await fetch(`http://localhost:3000/api/leaderboard/game-leaderboard?game=${encodeURIComponent(selectedGame)}&period=${period}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await response.json();
            setGameData(data.rows)
        } catch(err) {
            console.error(err)
        } finally {
            setLoading(false);
        }
    }

    // Fetch games
    async function fetchGames() {
        try{
            const response = await fetch('http://localhost:3000/api/games', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setGames(data);
        } catch(err){
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const renderScores = () => {
        const noData = (cols) => (
            <tr>
                <td colSpan={cols} className='no-data'>No Scores Yet!</td>
            </tr>
        )

        if (!gameData || gameData.length === 0) return (
            <table className='lb-table'>
                <tbody>{noData(4)}</tbody>
            </table>
        );

        switch (selectedGame) {
            // Reaction Time
            case games[0].name:
                return (
                    <table className='lb-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Average</th>
                                <th>Best</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                        {gameData.map((r, i) => (
                            <tr key={i} className={
                                `lb-row ${r.username === user.username ? 'highlight' : ''}`}
                            >
                                <td className='rank'>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${r.username}`)}
                                >
                                    {r.username}
                                </td>
                                <td className='blue'>{r.average}ms</td>
                                <td className='blue'>{r.best}ms</td>
                                <td className='green'>+{r.xp_earned}</td>
                                <td className='date'>{new Date(r.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Sequence Memory
            case games[1].name:
                return(
                    <table className='lb-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Level Reached</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                        {gameData.map((s, i) => (
                            <tr key={i} className={s.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${s.username}`)}
                                >
                                    {s.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{s.level_reached}</span>
                                        <span className='frequency'>x{s.times_reached}</span>
                                    </div>
                                </td>                                <td className='green'>+{s.xp_earned}</td>
                                <td className='date'>{new Date(s.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Number Memory
            case games[2].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Level Reached</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((n, i) => (
                            <tr key={i} className={n.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${n.username}`)}
                                >
                                    {n.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{n.level_reached}</span>
                                        <span className='frequency'>x{n.times_reached}</span>
                                    </div>
                                </td>                                <td className='green'>+{n.xp_earned}</td>
                                <td className='date'>{new Date(n.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Verbal Memory
            case games[3].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Score</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((v, i) => (
                            <tr key={i} className={v.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${v.username}`)}
                                >
                                    {v.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{v.score}</span>
                                        <span className='frequency'>x{v.times_reached}</span>
                                    </div>
                                </td>                                <td className='green'>+{v.xp_earned}</td>
                                <td className='date'>{new Date(v.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Visual Memory
            case games[4].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Level Reached</th>
                            <th>Grid Size Reached</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((v, i) => (
                            <tr key={i} className={v.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${v.username}`)}
                                >
                                    {v.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{v.level_reached}</span>
                                        <span className='frequency'>x{v.times_reached}</span>
                                    </div>
                                </td>
                                <td className='green'>{v.max_grid_size}x{v.max_grid_size}</td>
                                <td className='green'>+{v.xp_earned}</td>
                                <td className='date'>{new Date(v.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Typing Speed
            case games[5].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>WPM</th>
                            <th>Words Typed</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((t, i) => (
                            <tr key={i} className={t.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${t.username}`)}
                                >
                                    {t.username}
                                </td>
                                <td className='blue'>{t.wpm}</td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{t.words_typed} </span>
                                        <span className='green'> ({t.accuracy}%)</span>
                                    </div>
                                </td>
                                <td className='green'>+{t.xp_earned}</td>
                                <td className='date'>{new Date(t.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Rock Paper Scissors
            case games[6].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Record</th>
                            <th>Result</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((r, i) => (
                            <tr key={i} className={r.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${r.username}`)}
                                >
                                    {r.username}
                                </td>
                                <td className='record-cell'>
                                    <div className='score-stats'>
                                        <span className='gray'>P{r.total_played}:</span>
                                        <span className='win-loss'>
                                            <span className='green'>{r.wins}W</span>
                                            <span className='separator'>-</span>
                                            <span className='red'>{r.losses}L</span>
                                        </span>

                                        <span className='frequency'>
                                            x{r.times_reached}
                                        </span>
                                    </div>
                                </td>
                                {r.wins >= r.losses ?
                                    <td className='green'>WON</td>
                                    : <td className='red'>LOST</td>
                                }
                                <td className='green'>+{r.xp_earned}</td>
                                <td className='date'>{new Date(r.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Tic-Tac-Toe
            case games[7].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Record</th>
                            <th>Result</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((t, i) => (
                            <tr key={i} className={t.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${t.username}`)}
                                >
                                    {t.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='gray'>P{t.total_played}:</span>
                                        <span className='win-loss'>
                                            <span className='green'>{t.wins}W</span>
                                            <span className='separator'>-</span>
                                            <span className='gray'>{t.draws}D</span>
                                            <span className='separator'>-</span>
                                            <span className='red'>{t.losses}L</span>
                                        </span>
                                    </div>
                                </td>
                                {t.wins >= t.losses ?
                                    <td className='green'>WON</td>
                                    : <td className='red'>LOST</td>
                                }
                                <td className='green'>+{t.xp_earned}</td>
                                <td className='date'>{new Date(t.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Wordle
            case games[8].name:
                return (
                    <table className='lb-table'>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Username</th>
                                <th>Attempts</th>
                                <th>Found</th>
                                <th>XP</th>
                                <th>Played At</th>
                            </tr>
                        </thead>
                        <tbody>
                        {gameData.map((w, i) => (
                            <tr key={i} className={w.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${w.username}`)}
                                >
                                    {w.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{w.attempts}</span>
                                        <span className='frequency'>x{w.times_reached}</span>
                                    </div>
                                </td>
                                <td className='green'>YES</td>
                                <td className='green'>+{w.xp_earned}</td>
                                <td className='date'>{new Date(w.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );

            // Quick Maths
            case games[9].name:
                return (
                    <table className='lb-table'>
                        <thead>
                        <tr>
                            <th>#</th>
                            <th>Username</th>
                            <th>Score</th>
                            <th>Accuracy</th>
                            <th>Avg Response</th>
                            <th>XP</th>
                            <th>Played At</th>
                        </tr>
                        </thead>
                        <tbody>
                        {gameData.map((m, i) => (
                            <tr key={i} className={m.username === user.username ? 'highlight' : ''}>
                                <td className='rank'>{i + 1}</td>
                                <td
                                    className='lb-username clickable'
                                    onClick={() => navigate(`/profile/${m.username}`)}
                                >
                                    {m.username}
                                </td>
                                <td>
                                    <div className='score-stats'>
                                        <span className='blue'>{m.score}</span>
                                        <span className='frequency'>x{m.times_reached}</span>
                                    </div>
                                </td>
                                <td className='green'>{m.accuracy}% ({m.total_played} total)</td>
                                <td className='blue'>{m.avg_response_time}s</td>
                                <td className='green'>+{m.xp_earned}</td>
                                <td className='date'>{new Date(m.played_at).toLocaleDateString()}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                );
        }
    }

    return (
        <div className="lb-page">
            <div className='lb-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Leaderboard</h1>
            </div>

            {loading && <p className='lb-loading'>Loading ... </p> }

            {!loading && (
                <>
                    <div className='lb-content'>
                        {/* Top 15 XP all time  */}
                        <div className='lb-card'>
                            <div className='card-title-area'>
                                <h3 className='card-title'>🌍 All Time Top 15</h3>
                                <span>{totalUsers} Players Worldwide</span>
                            </div>
                            <div className='lb-top-scores-area'>
                                <table className="lb-table">
                                    <thead>
                                        <tr>
                                            <th>Rank</th>
                                            <th>Username</th>
                                            <th>Level</th>
                                            <th>Games Played</th>
                                            <th>XP</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topUserData.map((player, i) => (
                                            <tr
                                                key={i}
                                                className={`lb-row ${player.username === user.username ? 'highlight' : ''}
                                                        ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}
                                                `}
                                            >
                                                <td className='lb-rank'>
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                </td>
                                                <td
                                                    className='lb-username clickable'
                                                    onClick={() => navigate(`/profile/${player.username}`)}
                                                >
                                                    {player.username}
                                                </td>
                                                <td className='lb-level'>{player.level}</td>
                                                <td className='lb-level'>{player.games_played}</td>
                                                <td className='lb-xp'>{player.xp}</td>
                                            </tr>
                                        ))}

                                        {/* Current User not in top 15 */}
                                        {topCurrentUser && (
                                            <>
                                                <tr className='divider-row'>
                                                    <td colSpan={5} className='divider-cell'>...</td>
                                                </tr>
                                                <tr className='highlight'>
                                                    <td className='lb-rank'>#{topCurrentUser.player_rank}</td>
                                                    <td
                                                        className='lb-username clickable'
                                                        onClick={() => navigate(`/profile/${topCurrentUser.username}`)}
                                                    >
                                                        {topCurrentUser.username}
                                                    </td>
                                                    <td className='lb-level'>{topCurrentUser.level}</td>
                                                    <td className='lb-level'>{topCurrentUser.games_played}</td>
                                                    <td className='lb-xp'>{topCurrentUser.xp}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Leaderboard by XP */}
                        <div className='lb-card'>
                            <div className='lb-title'>
                                <h3 className='card-title'>⚡ Top XP Earned</h3>
                                <div className='lb-period'>
                                    {['Daily', 'Weekly', 'Monthly', 'All Time'].map(p => (
                                        <button
                                            key={p}
                                            className={`period-btn ${xpPeriod === p.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                                            onClick={() => {setXpPeriod(p.toLowerCase().replace(' ', ''))}}
                                        >
                                            {p === 'Daily' ? 'Daily' :
                                                p === 'Weekly' ? 'Weekly' :
                                                    p === 'Monthly' ? 'Monthly' :
                                                        p === 'Daily' ? 'Daily' :
                                                            'All Time'
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className='lb-top-xp-area'>
                                <table className='lb-table'>
                                    <thead>
                                    <tr>
                                        <th>Rank</th>
                                        <th>Username</th>
                                        <th>Level</th>
                                        <th>Games Played</th>
                                        <th>XP Earned</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {xpPeriodData.map((player, i) => (
                                            <tr key={i}
                                                className={`
                                                    lb-row ${player.username === user.username ? 'highlight' : ''}
                                                    ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}
                                                `}
                                            >
                                                <td className='lb-rank'>
                                                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                                </td>
                                                <td
                                                    className='lb-username clickable'
                                                    onClick={() => navigate(`/profile/${player.username}`)}
                                                >
                                                    {player.username}
                                                </td>
                                                <td className='lb-level'>{player.level}</td>
                                                <td className='lb-level'>{player.games_played}</td>
                                                <td className='lb-xp'>{player.xp_earned}</td>
                                            </tr>
                                        ))}

                                        {xpCurrentUser && (
                                            <>
                                                <tr className='divider-row'>
                                                    <td colSpan={5} className='divider-cell'>...</td>
                                                </tr>
                                                <tr className='highlight'>
                                                    <td className='lb-rank'>#{xpCurrentUser.player_rank}</td>
                                                    <td
                                                        className='lb-username clickable'
                                                        onClick={() => navigate(`/profile/${xpCurrentUser.username}`)}
                                                    >
                                                        {xpCurrentUser.username}
                                                    </td>
                                                    <td className='lb-level'>{xpCurrentUser.level}</td>
                                                    <td className='lb-level'>{xpCurrentUser.games_played}</td>
                                                    <td className='lb-xp'>{xpCurrentUser.xp_earned}</td>
                                                </tr>
                                            </>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Leaderboard per Game by time period*/}
                        <div className='lb-card'>
                            <div className='lb-title'>
                                <h3 className='card-title'>🎮 Top 10 Game Scores</h3>
                                <div className='lb-period'>
                                    {['Daily', 'Weekly', 'Monthly', 'All Time'].map(p => (
                                        <button
                                            key={p}
                                            className={`period-btn ${gamePeriod === p.toLowerCase().replace(' ', '') ? 'active' : ''}`}
                                            onClick={() => {setGamePeriod(p.toLowerCase().replace(' ', ''))}}
                                        >
                                            {p === 'Daily' ? 'Daily' :
                                                p === 'Weekly' ? 'Weekly' :
                                                   p === 'Monthly' ? 'Monthly' :
                                                       p === 'Daily' ? 'Daily' :
                                                           'All Time'
                                            }
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Game Selector */}
                            <div className='game-selector'>
                                {games.map(game => (
                                    <button
                                        key={game.name}
                                        className={`game-btn ${selectedGame === game.name ? 'active' : ''}`}
                                        onClick={() => setSelectedGame(game.name)}
                                    >
                                        <span>{game.emoji}</span>
                                        <span>{game.name}</span>
                                    </button>
                                ))}
                            </div>

                            <div className='scores-table-area'>
                                {renderScores()}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
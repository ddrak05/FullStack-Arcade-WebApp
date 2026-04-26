import {useState, useEffect} from 'react';
import {useNavigate, useParams} from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/compare.css';


export default function Compare() {
    const {token, user: me, refreshToken} = useAuth();
    const {username} = useParams();
    const navigate = useNavigate();

    const [period, setPeriod] = useState('all-time')
    const [myStats, setMyStats] = useState(null);
    const [otherStats, setOtherStats] = useState(null);
    const [gameScores, setGameScores] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComparison()
    }, [username, period]);

    async function fetchComparison() {
        try {
            refreshToken()
            if (!myStats) setLoading(true);
            const response = await fetch(`http://localhost:3000/api/user/compare/${username}?period=${period}`, {
                headers: {'Authorization' : `Bearer ${token}`}
            })
            const data = await response.json();

            if (!response.ok) {
                console.error("Server Error:", data.error);
                return;
            }

            setMyStats(data.myStats);
            setOtherStats(data.otherStats);
            setGameScores(data.gamesComparison || []);
            console.log(data.myStats.favorite, data.otherStats.favorite);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <div className='compare-load'>Loading ... </div>
    if (!myStats || !otherStats) return <div>Error Comparing Users ... </div>

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate(-1)}>Back</button>
            </div>

            <div className='h2h-header'>
                <h1 className='h2h-title'>
                    <span className='h2h-icon'>⚔️</span>
                    Head To Head Comparison
                    <span className='h2h-icon'>⚔️</span>
                </h1>
            </div>

            <div className='compare-container overview'>


                <div className='compare me'>
                    <div className='player-card me'>
                        <div className='avatar'>👤</div>
                        <h2 className='name'>{myStats.username}</h2>
                        <span className={`rank ${myStats.xp > otherStats.xp ? 'winner-text' : ''}`}>Rank #{myStats.rank}</span>
                    </div>
                    <div className={`stat-box ${myStats.level > otherStats.level ? 'winner' : ''}`}>{myStats.level}</div>
                    <div className={`stat-box ${myStats.xp > otherStats.xp ? 'winner' : ''}`}>{myStats.xp}</div>
                    <div className={`stat-box ${myStats.achievements > otherStats.achievements ? 'winner' : ''}`}>{myStats.achievements}</div>
                    <div className={`stat-box ${myStats.totalGames > otherStats.totalGames ? 'winner' : ''}`}>{myStats.totalGames}</div>
                    <div className={`stat-box ${myStats.favorite.played > otherStats.favorite.played ? 'winner' : ''}`}>{myStats.favorite.data}</div>
                </div>

                <div className='compare vs'>
                    <div className='header-box'>
                        <div className='icon'>VS</div>
                        <h3 className='title'>Information</h3>
                    </div>
                    <div className='info-label'>Level</div>
                    <div className='info-label'>Total XP</div>
                    <div className='info-label'>Achievements</div>
                    <div className='info-label'>Games Played</div>
                    <div className='info-label'>Favorite Game</div>
                </div>

                <div className='compare other'>
                    <div className='player-card other'>
                        <div className='avatar'>👤</div>
                        <h2 className='name'>{otherStats.username}</h2>
                        <span className={`rank ${otherStats.xp > myStats.xp ? 'winner-text' : ''}`}>Rank #{otherStats.rank}</span>
                    </div>
                    <div className={`stat-box ${otherStats.level > myStats.level ? 'winner' : ''}`}>{otherStats.level}</div>
                    <div className={`stat-box ${otherStats.xp > myStats.xp ? 'winner' : ''}`}>{otherStats.xp}</div>
                    <div className={`stat-box ${otherStats.achievements > myStats.achievements ? 'winner' : ''}`}>{otherStats.achievements}</div>
                    <div className={`stat-box ${otherStats.totalGames > myStats.totalGames ? 'winner' : ''}`}>{otherStats.totalGames}</div>
                    <div className={`stat-box ${otherStats.favorite.played > myStats.favorite.played ? 'winner' : ''}`}>{otherStats.favorite.data}</div>
                </div>
            </div>

            <div className='compare-container scores'>
                <div className='compare-title'>
                    <h3 className='title'>🏆 Best Scores</h3>
                    <div className='button-period'>
                        {['daily', 'weekly', 'monthly', 'all-time'].map(p => (
                            <button
                                key={p}
                                className={`period-btn ${period === p ? 'active' : ''}`}
                                onClick={(e) => {e.preventDefault(); setPeriod(p)}}
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

                <div className='scores-grid'>
                    {gameScores.map((game) => {
                        const myVal = game.myValue?.val || 0;
                        const myRec = game.myValue?.rec || '';

                        const otherVal = game.otherValue?.val || 0;
                        const otherRec = game.otherValue?.rec || '';

                        const winner =
                            (myVal > 0 && otherVal > 0) ?
                                (game.id === 1 ? (myVal < otherVal ? 'meWin' : 'otherWin') :
                                    (myVal > otherVal ? 'meWin' : 'otherWin'))

                            : (myVal > 0 ? 'meWin' :
                                    (otherVal > 0 ? 'otherWin' : ''));

                        return (
                            <div key={game.id} className='scores-row'>
                                <div className={`score-box me ${winner === 'meWin' ? 'winner' : ''}`}>
                                    {myVal > 0 ? (game.id === 1 ? `${game.label} ${myVal}ms ${myRec || ''}`  : `${game.label} ${myVal} ${myRec || ''}`) : '-'}
                                </div>

                                <div className='game-info'>
                                    <span className='game-emoji'>{game.emoji}</span>
                                    <span className='game-name'>{game.name}</span>
                                </div>

                                <div className={`score-box other ${winner === 'otherWin' ? 'winner' : ''}`}>
                                    {otherVal > 0 ? (game.id === 1 ? `${game.label} ${otherVal}ms ${otherRec || ''}` : `${game.label} ${otherVal} ${otherRec || ''}`) : '-'}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )

}
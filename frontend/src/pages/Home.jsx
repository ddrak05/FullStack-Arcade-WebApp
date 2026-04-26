import {useAuth} from '../context/AuthContext.jsx';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import {getLevel, getLevelProgress} from "../utils/levelLogic.js";
import '../styles/home.css';

export default function Home(){
    const {user, token, lastLevelRef, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [liveUser, setLiveUser] = useState(null);
    const [games, setGames] = useState([]);
    const [levelProgress, setLevelProgress] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeCategory, setActiveCategory] = useState(null);
    const benchmark = games.filter(g => g.category === 'Benchmark');
    const arcade = games.filter(g => g.category === 'Arcade');

    // Level up
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [newLevel, setNewLevel] = useState(null);

    // Fetch fresh XP from db
    async function fetchUserInfo() {
        try{
            refreshToken();
            if (!liveUser) setLoading(true);
            const response = await fetch('http://localhost:3000/api/user/info', {
                headers: {'Authorization' : `Bearer ${token}`}
            })
            const data = await response.json();
            const currentLevel = getLevel(data.xp);
            setLevelProgress(getLevelProgress(data.xp))

            if (lastLevelRef.current !== null && lastLevelRef.current < currentLevel) {
                setNewLevel(currentLevel);
                setShowLevelUp(true);
            }

            lastLevelRef.current = currentLevel;
            setLiveUser(data);
        } catch(err) {
            console.error("Failed to fetch live stats", err)
        } finally {
            setLoading(false);
        }
    }

    // Fetch games from db when the page loads
    async function fetchGames() {
        try{
            refreshToken();
            const response = await fetch('http://localhost:3000/api/games', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setGames(data);
        } catch(err){
            setError(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUserInfo();
    }, [])

    // Get games on page load
    useEffect(() => {
        fetchGames();
    }, [])

    const handleCategory = (category) => {
        setIsAnimating(true);
        setTimeout(() => {
            if (activeCategory === category) setActiveCategory(null);
            else setActiveCategory(category);
            setIsAnimating(false);
        }, 100);
    }

    if (loading) return <div className='home-page'>Loading games .... </div>
    if (error) return <div className='home-page'>Error: {error}</div>;

    return(
        <div className="home-page">
            <div className='home-title'>
                <h1>Welcome back {user.username}</h1>
                <div className='home-level'>
                    <h2 className='level-display'>Level {liveUser ? getLevel(liveUser?.xp) : '...'}</h2>
                    <div className='progress-section'>
                        <div className='progress-bar-container'>
                            <div className='progress-bar-fill'
                                 style={{ width: `${levelProgress}%` }}
                            >
                            </div>
                            <span className='xp-percentage'>
                                {getLevelProgress(liveUser?.xp)}%
                            </span>
                        </div>
                    </div>
                </div>

                {/* Level Up */}
                {showLevelUp && (
                    <div className='level-up-area' onClick={() => setShowLevelUp(false)}>
                        <div className='level-up'>
                            <span className='lvl-emoji'>🚀</span>
                            <h1>Level Up!</h1>
                            <p>You reached Level <span className='lvl-number'>{newLevel}</span>!</p>
                        </div>
                    </div>
                )}
            </div>

            <div className='category-cards'>
                {/* Benchmark Card */}
                <div
                    className={
                        `category-card ${activeCategory === 'Benchmark' ? 'compact active' : ''}
                        ${activeCategory && activeCategory !== 'Benchmark' ? 'compact' : ''}
                        ${isAnimating ? 'animating' : ''}`
                    }
                    onClick ={() => handleCategory('Benchmark')}
                >
                    <span className='category-emoji'>🧠</span>
                    {!activeCategory && (
                        <>
                            <h2 className='category-name'>Benchmark</h2>
                            <p className='category-desc'>Test your cognitive skills</p>
                            <h3>{benchmark.length} Games</h3>
                            <div className='category-games'>
                                {benchmark.map((g, i) => (
                                    <span key={i} className='category-game'>{g.name} </span>
                                ))}
                            </div>
                        </>
                    )}

                    {activeCategory && (
                        <h2 className='category-name'>Benchmark</h2>
                    )}
                </div>

                {/* Arcade Card */}
                <div
                    className={
                        `category-card ${activeCategory === 'Arcade' ? 'compact active' : ''}
                        ${activeCategory && activeCategory !== 'Arcade' ? 'compact' : ''}
                        ${isAnimating ? 'animating' : ''}`
                    }
                    onClick ={() => handleCategory('Arcade')}
                >
                    <span className='category-emoji'>🕹️</span>
                    {!activeCategory && (
                        <>
                            <h2 className='category-name'>Arcade</h2>
                            <p className='category-desc'>Classic games for fun</p>
                            <h3>{arcade.length} Games</h3>
                            <div className='category-games'>
                                {arcade.map((g, i) => (
                                    <span key={i} className='category-game'>{g.name} </span>
                                ))}
                            </div>
                        </>
                    )}

                    {activeCategory && (
                        <h2 className='category-name'>Arcade</h2>
                    )}
                </div>
            </div>

            {/* Games Grid */}
            {activeCategory && (
                <div className={`games-grid-wrapper ${activeCategory ? 'visible' : ''}`}>
                    <div className='games-grid'>
                        {(activeCategory === 'Benchmark' ? benchmark : arcade).map(game => (
                            <div key={game.id} className='game-card'
                                 onClick={(e) => {
                                     e.stopPropagation();
                                     navigate(game.path)
                                 }}
                            >
                                <div className='game-emoji-2'>{game.emoji}</div>
                                <h2>{game.name}</h2>
                                <p className='game-desc'>{game.description}</p>

                                <div className={`achievement-counter
                                    ${game.unlocked === game.total ? 'gold'
                                    : game.unlocked >= Math.round(game.total / 2) ? 'silver' : ''}`}
                                >
                                    🏆 {game.unlocked} / {game.total}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
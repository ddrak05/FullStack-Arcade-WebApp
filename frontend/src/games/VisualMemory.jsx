import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/visualMemory.css';

export default function Games() {
    const navigate = useNavigate();
    const {user, token, refreshToken} = useAuth();

    // Which cells are currently lit up
    const [activeCells, setActiveCells] = useState([]);
    const [clickedCells, setClickedCells] = useState([]);
    const [hidingCells, setHidingCells] = useState([]);

    const [startGame, setStartGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [unlocked, setUnlocked] = useState([]);
    const [pattern, setPattern] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);

    const [level, setLevel] = useState(1);
    const [xpEarned, setXpEarned] = useState(0);
    const [gridSize, setGridSize] = useState(3);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    async function saveScore() {
        try{
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/visual-memory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    level_reached: level,
                    max_grid_size: gridSize,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp);
            setUnlocked(data.achievementUnlocked);
        }catch(err){
            console.error(err);
        }
    }

    // Keep pattern in sync - keep the latest pattern
    const patternRef = useRef([]);
    useEffect(() => {
        patternRef.current = pattern;
    }, [pattern]);

    function generatePattern(count, size) {
        const cells = Array.from({length: size * size}, (_, i) => i);
        return cells.sort(() => Math.random() - 0.5).slice(0, count - 1);
    }

    function playPattern(pattern) {
        setIsPlaying(true);

        // Show all cells at once
        setTimeout(() => {
            setActiveCells(pattern);
        }, 800)

        // Start fade out
        setTimeout(() => {
            setHidingCells(pattern)
        }, 1400)

        // Hide them all
        setTimeout(() => {
            setActiveCells([]);
            setHidingCells([])
            setIsPlaying(false);
        }, 1900)
    }

    const handleStart = () => {
        setStartGame(true);
        const newPattern = generatePattern(level + 3, gridSize);
        patternRef.current = newPattern;
        setPattern(newPattern)
        playPattern(newPattern);
    }

    const handleClick = (i) => {
        // Ignore click if pattern is playing
        if (isPlaying) return;

        // Ignore click if cell has already been clicked
        if (clickedCells.includes(i)) return;

        if (pattern.includes(i)) {
            // Correct click
            const newClicked = [...clickedCells, i];
            setClickedCells(newClicked);

            if (newClicked.length === pattern.length) {
                // Level complete
                const newLevel = level + 1;
                setLevel(newLevel);
                setClickedCells([]);

                // Expand grid size every 3 levels, max 8x8
                let newGridSize = gridSize;
                if ((newLevel - 1) % 3 === 0 && gridSize < 8) {
                    newGridSize = gridSize + 1;
                    setGridSize(newGridSize);
                }
                const newPattern = generatePattern(newLevel + 3, gridSize);
                patternRef.current = newPattern;
                setPattern(newPattern);
                playPattern(newPattern);
            }
        } else if (!pattern.includes(i) || level === 64) {
            // Wrong Click - game over
            saveScore();
            setGameOver(true);
        }
    }

    const handlePlayAgain = () => {
        setGameOver(false);
        setLevel(1);
        setGridSize(3);
        setPattern([]);
        patternRef.current = [];
        setClickedCells([]);
        setActiveCells([]);
        setUnlocked([]);

        const newPattern = generatePattern(3, 3);
        setPattern(newPattern);
        patternRef.current = newPattern ;
        setIsPlaying(true);
        playPattern(newPattern);
    }

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Visual Memory</h1>
                {!startGame && (
                    <>
                        <p>Memorize the pattern of flashing squares</p>
                        <p>The grid size progressively increases</p>
                        <button className='start-btn' onClick={handleStart}>Begin!</button>
                    </>
                )}
            </div>

            {startGame && !gameOver && (
                <>
                    <span className='level'>Level {level}</span>
                    <div className={`vm-grid grid-${gridSize}`}>
                        {Array.from({length: gridSize * gridSize}, (_, i) => (
                            <div
                                key={i}
                                className={`vm-cell
                                    ${activeCells.includes(i) ? 'active' : ''}
                                    ${hidingCells.includes(i) ? 'hiding' : ''}
                                    ${clickedCells.includes(i) ? 'clicked' : ''}`
                                }
                                onClick={() => handleClick(i)}
                            />
                        ))}
                    </div>
                </>
            )}

            {gameOver && (
                <>
                    <div className='end-results'>
                        <h2>Game Over!</h2>

                        <div className='end-score'>
                            <span>You reached <span className='result-lvl'>Level {level}</span>!</span>
                            <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                        </div>

                        <div className='result'>
                            <span className='res-streak'>Streak Multiplier</span>
                            <span className='res-streak'>x{multiplier}</span>
                        </div>

                        <div className='result'>
                            <span className='res-number'>Grid Size Reached</span>
                            <span className='res-number'>{gridSize}x{gridSize}</span>
                        </div>

                        {unlocked.length > 0 && (
                            <div className="res-achievements">
                                <h2>Achievements Unlocked</h2>
                                {unlocked.map((ach) => (
                                    <div key={ach.id} className={`ach-unlocked-item ${ach.tier.toLowerCase()}`} title={ach.description}>
                                        <span>{ach.emoji} {ach.name}</span>
                                        <span className="green">+{ach.xp_reward} XP</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button className='play-again-2' onClick={handlePlayAgain}>Play Again</button>
                    </div>
                </>
            )}
        </div>
    )
}

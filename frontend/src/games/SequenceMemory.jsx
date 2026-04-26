import {useRef, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '../styles/games/sequenceMemory.css';
import {useAuth} from "../context/AuthContext.jsx";

const GRID_SIZE = 9;

function generateSequence(sequence) {
    return [...sequence, Math.floor(Math.random() * GRID_SIZE)];
}

export default function SequenceMemory() {
    const {user, token, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [activeCell, setActiveCell] = useState(-1);
    const [clickedCells, setClickedCells] = useState([]);

    const [sequence, setSequence] = useState([]);
    const [level, setLevel] = useState(1);
    const [xpEarned, setXpEarned] = useState(0);
    const [unlocked, setUnlocked] = useState([]);

    const [playerIndex, setPlayerIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const [startGame, setStartGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    async function saveScore(){
        try{
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/sequence-memory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    level_reached: level,
                    sequence: sequenceRef.current,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp)
            setUnlocked(data.achievementUnlocked)
        } catch(err) {
            console.log(err);
        }
    }

    const sequenceRef = useRef([]);
    // Keep ref in sync
    useEffect(() => {
        sequenceRef.current = sequence;
    }, [sequence]);

    function playSequence(seq) {
        seq.forEach((index, i) => {
            setTimeout(() => {
                setActiveCell(index);
            }, i * 700) // time between each cell

            // Turn it off after a short time
            setTimeout(() => {
                setActiveCell(-1)
            }, i * 700 + 600); // time shown
        })

        // Allow clicks after sequence finishes
        setTimeout(() => {
            setIsPlaying(false);
        }, seq.length * 700);
    }

    const handleStart = () => {
        setStartGame(true);

        const seq = generateSequence([]);

        setSequence(seq);
        setIsPlaying(true);
        setTimeout(() => {
            playSequence(seq);
        }, 800)
    }

    const handleClick = (i) => {
        // Ignore clicks while sequence is playing
        if (isPlaying) return;

        if (i === sequenceRef.current[playerIndex]){
            // Correct Click
            if (playerIndex + 1 >= sequenceRef.current.length) {
                // Completed the sequence - next level
                const newLevel = level + 1;
                setLevel(newLevel);
                setPlayerIndex(0);
                setClickedCells([]);

                const newSeq = generateSequence(sequenceRef.current);
                setSequence(newSeq);
                sequenceRef.current = newSeq;

                // Wait before playing next sequence
                setIsPlaying(true);
                setTimeout(() => {
                    playSequence(newSeq);
                }, 800)
            } else {
                // More clicks remaining
                setClickedCells(prev => [...prev, i])
                setTimeout(() => {
                    setClickedCells(prev => prev.filter(cell => cell !== i));
                }, 400);
                setPlayerIndex(playerIndex + 1);
            }
        } else {
            // Wrong click - game over
            saveScore();
            setGameOver(true);
        }
    }

    const handlePlayAgain = () => {
        setGameOver(false);
        setLevel(1);
        setPlayerIndex(0);
        setClickedCells([]);
        setUnlocked([])
        setSequence([]);
        sequenceRef.current = []
        setActiveCell(-1);
        setIsPlaying(false);
        setStartGame(true);

        const seq = generateSequence([]);

        setSequence(seq);
        setIsPlaying(true);
        setTimeout(() => {
            playSequence(seq);
        }, 800)
    }

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Sequence Memory</h1>
                {!startGame && (
                    <>
                        <p>Memorize the pattern of flashing squares</p>
                        <p>The sequence gets progressively longer</p>
                        <button className='start-btn' onClick={handleStart}>Begin!</button>
                    </>
                )}
            </div>

            {startGame && !gameOver && (
                <>
                    <span className='level'>Level {level}</span>
                    <div className='sm-grid'>
                        {Array.from({length: GRID_SIZE}, (_, i) => (
                            <div
                                key={i}
                                className={`
                                   sm-cell ${activeCell === i ? 'active' : ''}
                                   ${clickedCells.includes(i) ? 'clicked' : ''}`
                                }
                                onClick={() => handleClick(i)}
                            >
                            </div>
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
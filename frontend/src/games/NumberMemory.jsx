import {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/numberMemory.css';

function generateNumber(digits) {
    // First number not 0
    let number = '';
    number += Math.floor(Math.random() * 9) + 1;
    for (let i = 1; i < digits; i++) {
        number += Math.floor(Math.random() * 10) ;
    }
    return number;
}

export default function NumberMemory() {
    const {user, token, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [startGame, setStartGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [unlocked, setUnlocked] = useState([])

    const [level, setLevel] = useState(1);
    const [number, setNumber] = useState(generateNumber(1));
    const [visible, setVisible] = useState(false);
    const [guess, setGuess] = useState('');
    const [xpEarned, setXpEarned] = useState(0);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Connect to Database
    async function saveScore(){
        try {
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/number-memory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    level_reached: level,
                    number_fail: number,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp);
            setUnlocked(data.achievementUnlocked || [])
        } catch (err) {
            console.error(err);
        }
    }

    // Autofocus on input when number hides
    const inputRef = useRef(null);
    useEffect(() => {
        if (!visible && startGame) {
            inputRef.current?.focus();
        }
    }, [visible]);

    // Hide the number after 3 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false)
        }, 3000);
        return () => clearTimeout(timer);
    }, [number]) // Re-runs every time a new number is shown

    const handleStart = () => {
        setStartGame(true);
        setVisible(true);
    }

    const handleSubmit = () => {
        if (guess === number){
            // Correct - Next Level: Add another digit
            setLevel(level + 1);
            setGuess('');
            setVisible(true);
            setNumber(generateNumber(level + 1));
        } else {
            saveScore();
            setGameOver(true);
        }
    }

    const handlePlayAgain = () => {
        setStartGame(false);
        setGameOver(false);
        setLevel(1);
        setNumber(generateNumber(1));
        setVisible(false);
        setUnlocked([])
        setGuess('');
    }

    return (
        <div className="game-page">
            <div className="game-header">
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Number Memory</h1>
                {!startGame && (
                    <>
                        <p>Remember the number shown, then type it in when it disappears</p>
                        <p>The numbers gets one digit longer every level</p>
                        <button className='start-btn' onClick={handleStart}>Begin!</button>
                    </>
                 )}
            </div>

            {startGame && !gameOver && (
                <>
                    <div className='number-box'>
                        <span className='level'>Level {level}</span>
                        {visible ? (
                                <>
                                    <h2 className='number'>{number}</h2>
                                    <div className='timer-bar-container'>
                                        <div className='timer-bar' key={number}></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <h2 className='number'>?</h2>
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        handleSubmit();
                                    }}>
                                        <input ref={inputRef}
                                               className='guess'
                                               type='text'
                                               value={guess}
                                               onChange={(e) => setGuess(e.target.value.replace(/[^0-9]/g, ''))}
                                               title='Please enter the number you saw!'
                                               required
                                        />
                                        <button className='submit'>Submit</button>
                                    </form>
                                </>
                            )
                        }
                    </div>
                </>
            )}

            {gameOver && (
                <>
                    <div className='end-results reaction'>
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
                            <span className='res-number'>Number: </span>
                            <span className='res-number'>{number}</span>
                        </div>

                        <div className='result'>
                            <span className='res-guess'>Your Guess: </span>
                            <span className='res-guess'>{guess}</span>
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
import {useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/reactionTime.css';

// Game States
const STATE = {
    IDLE: 'idle',           // waiting to start
    WAITING: 'waiting',     // started, waiting for green
    READY: 'ready',         // green
    RESULT: 'result',       // showing the result
    FINAL :'final'          // all 3 tries done, show summary
};

const MAX_TRIES = 3;

export default function ReactionTime() {
    const [state, setState] = useState(STATE.IDLE);

    // result of current try in ms
    const [reactionTime, setReactionTime] = useState(null);

    // true if user clicked too early
    const [earlyClick, setEarlyClick] = useState(false);

    // array of all valid reaction times
    const [tries, setTries] = useState([]);

    // useRef stores values that don't cause a re-render when changed
    // timestamp when green screen appeared
    const startTime = useRef(null);

    // Reference to the setTimeout so we can cancel it
    const timeout = useRef(null);

    // Achievement unlocked
    const [unlocked, setUnlocked] = useState([]);

    const {user, token, refreshToken} = useAuth();
    const navigate = useNavigate();
    const [xpEarned, setXpEarned] = useState(0);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Connect to Database
    async function saveScore (updatedTries) {
        try{
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/reaction-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // JWT token from AuthContext
                },
                body: JSON.stringify({
                    try1: updatedTries[0],
                    try2: updatedTries[1],
                    try3: updatedTries[2],
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp);

            // Check if achievement has been unlocked
            if (data.achievementUnlocked && data.achievementUnlocked.length > 0) {
                setUnlocked(data.achievementUnlocked);
            }
        } catch(err) {
            console.error('Failed to save score', err);
        }
    }

    const handleStart = () => {
        setEarlyClick(false);
        setReactionTime(null);
        setState(STATE.WAITING);

        // Random time until the green screen appears (2 - 5 seconds)
        const delay = Math.random() * 3000 + 2000;
        timeout.current = setTimeout(() => {
            setState(STATE.READY);

            // Record exact time green appeared
            startTime.current = Date.now();
        }, delay);
    }

    const handleClick = () => {
        if (state === STATE.FINAL){
            return;
        }

        // Start game from idle
        if (state === STATE.IDLE) {
            handleStart();
            return;
        }

        // User clicked before green screen - cancel timer and show warning message
        if (state === STATE.WAITING){
            clearTimeout(timeout.current);
            setEarlyClick(true);
            setState(STATE.RESULT);
            return;
        }

        // Clicked on green screen
        if (state === STATE.READY){
            // Calculate time between click and appearance of green screen
            const time = Date.now() - startTime.current;
            setReactionTime(time);

            // Add try
            const updatedTries =[...tries, time];
            setTries(updatedTries);

            // If all tries are done go to final screen
            // Otherwise show result
            if(updatedTries.length >= MAX_TRIES){
                saveScore(updatedTries);
                setState(STATE.FINAL);
            } else {
                setState(STATE.RESULT);
            }
        }

        // Clicked on result screen - start next try
        if(state === STATE.RESULT && tries.length < MAX_TRIES){
            handleStart();
        }
    }

    // Calculate BEST and ABG from tries
    const getBest = () => Math.min(...tries);
    const getAverage = () => Math.round(tries.reduce((a, b) => a + b, 0) / tries.length);

    // Returns a rating message based on reaction time
    const getRating = (ms) => {
        if (ms < 200) return '⚡ Incredible!';
        if (ms < 300) return '🔥 Great!';
        if (ms < 500) return '👍 Good!';
        return '😅 Keep practicing!';
    };

    // Resets everything back to the start
    const handlePlayAgain = () => {
        setTries([]);
        setUnlocked([])
        setReactionTime(null);
        setEarlyClick(false);
        setState(STATE.IDLE);
    }

    // Returns the correct CSS class based on current state
    const getBoxStyle = () => {
        if (state === STATE.READY) return 'reaction-box ready';
        if (state === STATE.WAITING) return 'reaction-box waiting';
        return 'reaction-box idle';
    }

    // Final screen
    if(state === STATE.FINAL){
        return(
            <div className='game-page'>
                <div className='game-header'>
                    <button className='back' onClick={() => navigate('/')}>Back</button>
                    <h1>Reaction Time</h1>
                </div>

                <div className='end-results'>
                    <h2>Game Over!</h2>

                    <div className="end-score">
                        <span>You got an average of <span className='result-avg'>{getAverage()}ms</span>!</span>
                        <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                    </div>

                    <div className='result'>
                        <span className='res-streak'>Streak Multiplier</span>
                        <span className='res-streak'>x{multiplier}</span>
                    </div>

                    <div className='result'>
                        <span>Best Attempt</span>
                        <span>{getBest()}ms</span>
                    </div>

                    <div className='result'>
                        <span>Tries</span>
                        <span>{tries[0]}ms, {tries[1]}ms, {tries[2]}ms</span>
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
            </div>
        )
    }

    // Main game screen
    return (
        <div className="game-page">
            <div className="game-header">
                <button className="back" onClick={() => navigate('/')}>Back</button>
                <h1> Reaction Time</h1>
                {state !== STATE.FINAL && (
                    <>
                        <p>Click the large box below to start</p>
                        <p>Wait for the red screen to turn <strong>Green</strong> and press again as fast as you can</p>
                    </>
                )}
                <p className='try'>Try {tries.length + 1} of {MAX_TRIES}</p>
            </div>

            {/* Box */}
            <div className={getBoxStyle()} onClick={handleClick}>
                {state === STATE.IDLE && (
                    <>
                        <h2>Click the box to start</h2>
                    </>
                )}
                {state === STATE.WAITING && (
                    <>
                        <h2>Waiting for green ... </h2>
                    </>
                )}
                {state === STATE.READY && (
                    <>
                        <h2>CLICK!</h2>
                    </>
                )}
                {state === STATE.RESULT && !earlyClick && (
                    <>
                        <h2 className='ms'>{reactionTime}ms</h2>
                        <p className='continue'>Click anywhere to continue</p>
                    </>
                )}
                {state === STATE.RESULT && earlyClick && (
                    <>
                        <h2>Too Early!</h2>
                        <p>Wait for the screen to turn green</p>
                    </>
                )}
            </div>

            {/* Show next try button after each attempt */}
            {state === STATE.RESULT && tries.length === MAX_TRIES && (
                <>
                    <button className='play-again-2' onClick={handleStart}>
                        See Results
                    </button>
                </>
            )}
        </div>
    )
}
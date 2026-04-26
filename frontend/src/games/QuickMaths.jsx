import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/quickMaths.css';

const getEquation = (score) => {
    let question, answer;
    if (score < 3) {
        const x = Math.floor(Math.random() * 80);
        const y = Math.floor(Math.random() * 80);
        question = `${x} + ${y}`;
        answer = x + y;
    } else if (score <= 8) {
        const x = Math.floor(Math.random() * 15) + 2;
        const y = Math.floor(Math.random() * 12) + 2;
        const z = Math.floor(Math.random() * 20) + 1;
        question = `(${x} x ${y}) + ${z}`
        answer = (x * y) + z;
    } else {
        const x = Math.floor(Math.random() * 5) + 3;
        const y = Math.floor(Math.random() * 30) + 10;
        const z = Math.floor(Math.random() * 9) + 2;
        question = `${x} × (${y} - ${z})`;
        answer = x * (y - z);
    }
    return {question, answer};
}

const getChoices = (answer) => {
    const choices = new Set();
    choices.add(answer)

    while (choices.size < 4) {
        const offset = Math.floor(Math.random() * 20) - 10;
        const distractor = answer + (offset === 0 ? 5 : offset);
        if (distractor !== answer) {
            choices.add(distractor);
        }
    }
    return Array.from(choices).sort(() => Math.random() - 0.5)
}

export default function QuickMaths() {
    const {user, token, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [startGame, setStartGame] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);
    const [unlocked, setUnlocked] = useState([])
    const hasSaved = useRef(false);

    const [timer, setTimer] = useState(60);
    const [countdown, setCountdown] = useState(null)
    const [equation, setEquation] = useState(null);

    const [correctAnswer, setCorrectAnswer] = useState(null);
    const [choices, setChoices] = useState([])

    const [score, setScore] = useState(0)
    const [total, setTotal] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [avgTime, setAvgTime] = useState(0);
    const [correctTimes, setCorrectTimes] = useState([]);
    const [startTime, setStartTime] = useState(null);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Save Score
    async function saveScore (score, total, avgTime, accuracy) {
        try {
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/quick-maths', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    score: score,
                    total: total,
                    avg_response_time: avgTime,
                    accuracy: accuracy,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp);
            setUnlocked(data.achievementUnlocked);
        } catch (err) {
            console.error(err);
        }
    }

    const handleStart = () => {
        hasSaved.current = false
        setCountdown(3)
        setTimer(60)
        const equation = getEquation(0)
        setEquation(equation.question)
        setCorrectAnswer(equation.answer)
        setChoices(getChoices(equation.answer))
        setStartTime(Date.now())
    }

    const handleAnswer = (choice) => {
        if (timer <= 0 || gameOver) return;
        const timeTaken = (Date.now() - startTime) / 1000;
        setTotal(prev => prev + 1)

        if (choice === correctAnswer) {
            const newScore = score + 1;
            setScore(newScore);
            setCorrectTimes(prev => [...prev, timeTaken]);
        } else {
            setTimer(prev => Math.max(0, prev - 2));
        }
        const next = getEquation(score + 1)
        setEquation(next.question)
        setCorrectAnswer(next.answer)
        setChoices(getChoices(next.answer))
        setStartTime(Date.now())
    }

    const handlePlayAgain = () => {
        hasSaved.current = false;
        setStartGame(false)
        setGameOver(false)
        setCountdown(3)
        setTimer(60)
        setScore(0)
        setTotal(0)
        setCorrectTimes([])
        setUnlocked([])

        const equation = getEquation(0)
        setEquation(equation.question)
        setCorrectAnswer(equation.answer)
        setChoices(getChoices(equation.answer))
        setStartTime(Date.now())
    }

    // Timer
    useEffect(() => {
        let interval;
        if (startGame && !gameOver && timer > 0) {
            interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000)
        } else if (timer === 0 && startGame) {
            if (hasSaved.current) return;
            hasSaved.current = true;

            const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
            const avgTime = correctTimes.length > 0
                ? (correctTimes.reduce((a, b) => a + b, 0) / correctTimes.length).toFixed(2)
                : 0;
            setAccuracy(accuracy)
            setAvgTime(avgTime)

            setGameOver(true);
            saveScore(score, total, avgTime, accuracy);
        }
        return () => clearInterval(interval)
    }, [startGame, gameOver, timer]);

    // Countdown
    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            setCountdown(null);
            setStartGame(true);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    return (
        <div className="game-page">
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Quick Maths</h1>
                <p>Get as many corrects answers as you can within the time limit</p>
                {!startGame && !countdown && (
                    <button className='start-btn' onClick={handleStart}>Begin!</button>
                )}
            </div>

            {countdown && (
                <div className='countdown'>
                    <h1>- {countdown} -</h1>
                </div>
            )}

            {startGame && !gameOver && (
                <div className='qm-container'>
                    <div className='qm-stats'>
                        <span className='score'>Score: {score}</span>
                        <span className='separator'> | </span>
                        <span className='timer'>Time: {timer}s</span>
                    </div>

                    <div className='qm-area'>
                        <div className='equation-box'>
                            <span className='equation-text'>{equation}</span>
                        </div>

                        <div className='choices-grid'>
                            {choices.map((choice, index) => (
                                <button
                                    key={index}
                                    className='choice-btn'
                                    disabled={timer <= 0}
                                    onClick={() => handleAnswer(choice)}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {gameOver && (
                <>
                    <div className='end-results'>
                        <h2>Game Over!</h2>

                        <div className='end-score'>
                            <span>You scored <span className='result-lvl'>{score} Points</span>!</span>
                            <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                        </div>

                        <div className='result'>
                            <span className='res-streak'>Streak Multiplier</span>
                            <span className='res-streak'>x{multiplier}</span>
                        </div>

                        <div className='result'>
                            <span>Total Answered</span>
                            <span>{total}</span>
                        </div>

                        <div className='result'>
                            <span>Avg Time per Correct Answer</span>
                            <span>{avgTime}s</span>
                        </div>

                        <div className='result'>
                            <span className={`${accuracy >= 80 ? 'green' : 'red'}`}>Accuracy</span>
                            <span className={`${accuracy >= 80 ? 'green' : 'red'}`}>{accuracy}%</span>
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
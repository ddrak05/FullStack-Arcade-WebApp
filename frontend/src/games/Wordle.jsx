import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import {WORDS, ANSWERS} from '../data/wordleWords.js'
import '../styles/games/wordle.css';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export default function Wordle() {
    const {user, token, refreshToken} = useAuth()
    const navigate = useNavigate();

    // Progress
    const [guesses, setGuesses] = useState([])
    const [currentRow, setCurrentRow] = useState(0);
    const [targetWord, setTargetWord] = useState('')

    // Get Guess
    const [currentGuess, setCurrentGuess] = useState([])

    const [error, setError] = useState('')
    const [gameOver, setGameOver] = useState(false)
    const [xpEarned, setXpEarned] = useState(false)
    const [found, setFound] = useState(false)
    const [unlocked, setUnlocked] = useState([])

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Save Score
    async function saveScore (isFound) {
        try {
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/wordle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    word: targetWord,
                    attempts: currentRow + 1,
                    found: isFound,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp);
            setUnlocked(data.achievementUnlocked);
        } catch (err) {
            console.error(err)
        }
    }

    // Get Answer
    const getTarget = () => {
        const random = Math.floor(Math.random() * ANSWERS.length)
        const selected = ANSWERS[random].toUpperCase()
        setTargetWord(selected)
    }

    // Get Input
    const handleKey = (e) => {
        if (gameOver) return;
        const key = e.key.toUpperCase();

        if (key === 'BACKSPACE') {
            setCurrentGuess(prev => prev.slice(0, -1))
            return;
        }

        if (key === 'ENTER') {
            if (currentGuess.length === 5) {
                const guessWord = currentGuess.join('').toLowerCase()
                console.log(guessWord)
                // Check if word exists
                if (!WORDS.includes(guessWord)) {
                    setError('Word does not exist!')
                    setTimeout(() => setError(''), 2000)
                    return;
                }

                // Process Guess
                setGuesses(prev => [...prev, currentGuess]);
                setCurrentGuess([])
                setCurrentRow(prev => prev + 1)

                // Check for Win
                if (guessWord.toUpperCase() === targetWord) {
                    setError('GENIUS!');
                    setFound(true)
                    saveScore(true)
                    setTimeout(() => setError(''), 2000)
                    setTimeout(() => setGameOver(true), 2000)
                    return
                }

                // Check for loss
                if (currentRow === 5 && guessWord.toUpperCase() !== targetWord) {
                    setError(`Game Over! The word was ${targetWord}`)
                    setFound(false)
                    saveScore(false)
                    setTimeout(() => setError(''), 2000)
                    setTimeout(() => setGameOver(true), 2000)
                    return;
                }
            } else {
                setError('Only 5 letters words allowed!')
                setTimeout(() => setError(''), 2000)
            }
            return;
        }

        if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
            setCurrentGuess(prev => [...prev, key]);
        }
    }

    // Get Letter Positions
    const letterStatus = (guessArray, target) => {
        const targetArray = target.split('');
        const status = Array(5).fill('absent')
        const targetCheck = [...targetArray];

        // Find all CORRECT (Green)
        guessArray.forEach((letter, i) => {
            if (letter === targetArray[i]) {
                status[i] = 'correct';
                targetCheck[i] = null
            }
        })

        // Find all PRESENT (Yellow)
        guessArray.forEach((letter, i) => {
            if (status[i] !== 'correct' && targetCheck.includes(letter)) {
                status[i] = 'present';
                targetCheck[targetCheck.indexOf(letter)] = null;
            }
        })
        return status;
    }

    const keyStatuses = guesses.reduce((acc, guess) => {
        const statuses = letterStatus(guess, targetWord);
        guess.forEach((letter, i) => {
            const currentStatus = statuses[i];
            const prevStatus = acc[letter];

            if (currentStatus === 'correct') {
                acc[letter] = 'correct';
            } else if (currentStatus === 'present' && prevStatus !== 'correct') {
                acc[letter] = 'present';
            } else if (currentStatus === 'absent' && !prevStatus) {
                acc[letter] = 'absent';
            }
        });
        return acc;
    }, {});

    const handlePlayAgain = () => {
        setGameOver(false)
        setGuesses([])
        setCurrentGuess([])
        setCurrentRow(0)
        setError('')
        setUnlocked([])
        getTarget()
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
        }
    }, [currentGuess, currentRow, gameOver, targetWord])

    useEffect(() => {
        getTarget()
    }, [])

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Wordle</h1>
                <p>Guess the 5-letter word in 6 tries</p>
            </div>

            {!gameOver && (
                <>
                    <div className='wordle-container'>
                        {error && <div className='wordle-error'>{error}</div>}

                        <div className='wordle-grid'>
                            {Array.from({length: 6}).map((_, rowIndex) => {
                                const isCurrentRow = rowIndex === currentRow

                                let row = Array(5).fill('')
                                let status = Array(5).fill('')
                                if (isCurrentRow) {
                                    row = [...currentGuess, ...Array(5 - currentGuess.length).fill('')]
                                } else if (rowIndex < currentRow) {
                                    row = guesses[rowIndex]
                                    status = letterStatus(guesses[rowIndex], targetWord)
                                }

                                return (
                                    <div className='wordle-row' key={rowIndex}>
                                        {row.map((letter, colIndex) => (
                                            <div key={colIndex}
                                                 className={`wordle-cell
                                            ${letter ? 'filled' : ''}
                                            ${status[colIndex]}`}
                                            >
                                                {letter}
                                            </div>
                                        ))}
                                    </div>
                                )
                            })}
                        </div>

                        <div className='wordle-keyboard'>
                            {KEYBOARD_ROWS.map((row, i) => (
                                <div key={i} className='keyboard-row'>
                                    {row.map((key) => {
                                        const status = keyStatuses[key] || '';
                                        return (
                                            <button key={key} className={`keyboard-key ${status}`}>
                                                {key}
                                            </button>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {gameOver && (
                <>
                    <div className='end-results'>
                        <h2>Game Over!</h2>


                        <div className='end-score'>
                            {found ? (
                                <span>You found the word in <span className='result-lvl'>{currentRow} tries</span>!</span>
                            ) : (
                                <span>The word was <span className='result-lvl'>{targetWord}</span>!</span>
                            )}
                            <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                        </div>

                        <div className='result'>
                            <span className='res-streak'>Streak Multiplier</span>
                            <span className='res-streak'>x{multiplier}</span>
                        </div>

                        <div className='result'>
                            <span>Word</span>
                            <span>{targetWord}</span>
                        </div>

                        <div className='result'>
                            <span>Guesses</span>
                            <span>{currentRow}</span>
                        </div>

                        {unlocked?.length > 0 && (
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

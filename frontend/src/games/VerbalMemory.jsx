import {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import {WORDS} from '../data/verbalWords.js';
import '../styles/games/verbalMemory.css';

export default function VerbalMemory() {
    const navigate = useNavigate();
    const {user, token, refreshToken} = useAuth();

    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [currentWord, setCurrentWord] = useState(getNextWord([]));
    const [shownWords, setShownWords] = useState([]);
    const [seenWords, setSeenWords] = useState([]);
    const [unlocked, setUnlocked] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [startGame, setStartGame] = useState(false);
    const [xpEarned, setXpEarned] = useState(0);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Connect to Database
    async function saveScore() {
        try {
            refreshToken()
            const response = await fetch('http://localhost:3000/api/scores/verbal-memory', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    score: score,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp)
            setUnlocked(data.achievementUnlocked)
        } catch (err) {
            console.error('Failed to save score', err);
        }
    }

    function getNextWord(shownWords) {
        // Random words from WORDS for first 3 words shown
        if (shownWords.length < 3) {
            return WORDS[Math.floor(Math.random() * WORDS.length)]
        }

        // Then: 40% of a SHOWN word 60% of a NEW word (words 3 - 10)
        //     : 50% of a SHOWN word 50% of a NEW word (words 11 - ...)
        const setSeen =
            shownWords.length <= 10 ? Math.random() < 0.40 : Math.random() < 0.50;

        // Return a word from the shownWords list
        if (setSeen) {
            return shownWords[Math.floor(Math.random() * shownWords.length)]
        }

        // Return a NEW word
        return WORDS[Math.floor(Math.random() * WORDS.length)]
    }

    const handleStart = () => {
        setStartGame(true);
    }

    const handleClick = (type) => {
        if (type === 'seen'){
            if(seenWords.includes(currentWord)){
                setScore(score + 1);
            } else {
                if (lives - 1 === 0) {
                    saveScore();
                    setGameOver(true);
                    return;
                }
                setLives(lives - 1);
            }
            const word = getNextWord(shownWords);
            setCurrentWord(word);
            setShownWords([...shownWords, word]);
        }

        if (type === 'new') {
            if(seenWords.includes(currentWord)){
                if (lives - 1 === 0) {
                    saveScore();
                    setGameOver(true);
                    return;
                }
                setLives(lives - 1);
            } else {
                setScore(score + 1);
                setSeenWords([...seenWords, currentWord]);
            }
            const word = getNextWord(shownWords);
            setCurrentWord(word);
            setShownWords([...shownWords, word]);
        }
    }

    const handlePlayAgain = () => {
        setScore(0);
        setLives(3);
        setSeenWords([]);
        setUnlocked([]);
        setGameOver(false);

        const word = getNextWord([]);
        setCurrentWord(word);
        setShownWords([word]);
    }

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Verbal Memory</h1>

                {!gameOver && (
                    <>
                        <p>Words will be displayed on the screen</p>
                        <p>Click whether you have seen the word (<strong>SEEN</strong>) or not (<strong>NEW</strong>)</p>
                        <p>You have 3 lives</p>

                        {!startGame && (
                            <>
                                <button className='start-btn' onClick={handleStart}>Start</button>
                            </>
                        )}
                    </>
                )}
            </div>

            {!gameOver && startGame && (
                <>
                    <div className='verbal-info'>
                        <span>Score: {score + 1} | </span>
                        <span>Lives: {lives}</span>
                    </div>
                    <div className='words'>
                        <h2>{currentWord}</h2>
                    </div>

                    <div className='buttons'>
                        <button className='btn seen' onClick={() => handleClick('seen')}>SEEN</button>
                        <button className='btn new' onClick={() => handleClick('new')}>NEW</button>
                    </div>
                </>
            )}

            {gameOver && (
                <>
                    <div className='end-results'>
                        <h2>Game Over!</h2>

                        <div className='end-score'>
                            <span>You scored <span className='result-score'>{score} Points</span>!</span>
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

                    <div className='history'>
                        <h2>Words Shown</h2>
                        <div className='history-words'>
                            {shownWords.map((word, i) => (
                                <span key={i} className='history-word'>{word}</span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
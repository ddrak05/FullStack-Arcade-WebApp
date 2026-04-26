import {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import {WORDS, QUOTES} from '../data/typingWords.js';
import '../styles/games/typingSpeed.css';

function generateWordList(mode) {
    if (mode === 'words'){
        return [...WORDS].sort(
            () => Math.random() - 0.5
        ).slice(0, 100).join(' ');
    } else {
        return QUOTES[Math.floor
            (Math.random() * QUOTES.length)
        ];
    }
}

export default function TypingSpeed(){
    const {user, token, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState('');
    const [wordList, setWordList] = useState([]);
    const [xpEarned, setXpEarned] = useState(0);

    const [timer, setTimer] = useState(60);
    const [countdown, setCountdown] = useState(null);
    const [started, setStarted] = useState(false);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [input, setInput] = useState('');
    const [wordStatus, setWordStatus] = useState(Array(wordList.length).fill(''));
    const inputRef = useRef(null);

    const [gameOver, setGameOver] = useState(false);
    const [unlocked, setUnlocked] = useState([]);
    const currentIndexRef = useRef(0);
    const wordStatusRef = useRef([]);

    // To precent double saving
    const savedRef = useRef(false);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    // Save Score to Database
    async function saveScore () {
        const total = currentIndexRef.current;
        const correct = wordStatusRef.current.filter(s => s === 'correct').length;
        const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;

        if (savedRef.current) return; // already saved
        savedRef.current = true;

        try{
            refreshToken();
            const response = await fetch("http://localhost:3000/api/scores/typing-speed", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    words_typed: total,
                    wpm: correct,
                    accuracy: accuracy,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp)
            setUnlocked(data.achievementUnlocked)
        }catch(err){
            console.error(err);
        }
    }

    // Keeps refs in sync
    useEffect(() => {
        currentIndexRef.current = currentIndex;
    }, [currentIndex]);

    useEffect(() => {
        wordStatusRef.current = wordStatus;
    }, [wordStatus]);

    // Autofocus the input when game starts
    useEffect(() => {
        if (started) inputRef.current.focus();
    }, [started])

    // Timer
    useEffect(() => {
        if(!started) return;

        const interval = setInterval(() => {
            setTimer(t => {
                if (t <= 1) {
                    clearInterval(interval);
                    saveScore();
                    setGameOver(true);
                    setInput('')
                    // game over
                    return 0;
                }
                return t - 1;
            })
        }, 1000)
        return () => {clearInterval(interval);};
    }, [started]);

    // Countdown
    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            setCountdown(null);
            setStarted(true);
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [countdown]);

    // Autoscroll if needed
    useEffect(() => {
        const activeWord = document.querySelector('.word.active');
        if (activeWord) {
            activeWord.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }, [currentIndex]);

    const handleModeSelect = (selectedMode) => {
        const list = generateWordList(selectedMode).split(' ');
        setWordList(list);
        setWordStatus(Array(list.length).fill(''));
        setMode(selectedMode);
        setCountdown(3);
    }

    const handleInput = (e) => {
        const value = e.target.value;

        // User pressed space - check the word
        if (value.endsWith(' ')) {
            const typed = value.trim();
            const isCorrect = typed === wordList[currentIndex];

            const newStatus = [...wordStatus]
            newStatus[currentIndex] = isCorrect ? 'correct' : 'incorrect';
            setWordStatus(newStatus);

            setCurrentIndex(currentIndex + 1);
            setInput('');
            return;
        }
        setInput(value)
    }

    const handleRestart = () => {
        setMode(null);
        setTimer(60);
        setStarted(false);
        setCurrentIndex(0);
        setWordStatus(Array(wordList.length).fill(''));
        setUnlocked([])
        setGameOver(false);
        savedRef.current = false;
    }

    return (
        <div className="game-page">
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Typing Speed</h1>
                {!mode && (
                    <>
                        <p>Choose between focused random words or full sentences</p>
                        <p>You will have {timer} seconds to type as many words as possible</p>
                        <p>Only correct words count toward your WPM</p>
                    </>
                )}
            </div>

            {!mode && (
                <>
                    <div className='mode-select'>
                        <h2>Choose a Mode</h2>
                        <div className='mode-buttons'>
                            <button className='mode-btn' onClick={() => handleModeSelect('quotes')}>
                                Sentences
                            </button>
                            <button className='mode-btn' onClick={() => handleModeSelect('words')}>
                                Random Words
                            </button>
                        </div>
                    </div>
                </>
            )}

            {countdown && (
                <div className='countdown'>
                    <h1>- {countdown} -</h1>
                </div>
            )}

            {started && !gameOver && (
                <>
                    <div className='word-list'>
                        <div className='word-header'>
                            <span className='timer'>Time Remaining {timer}s</span>
                            <div className='time-bar'></div>
                        </div>

                        <div className='type-box'>
                            <input
                                ref={inputRef}
                                className='type-input'
                                type='text'
                                value={input}
                                onChange={handleInput}
                                disabled={!started || gameOver}
                                placeholder='Start typing...'
                            />
                        </div>

                        <div className='word-text'>
                            {wordList.map((word, i) => (
                                <span key={i} className={`word
                                        ${wordStatus[i]} 
                                        ${i === currentIndex ? 'active' : ''}
                                    `}
                                >
                                    {word}
                                </span>
                            ))}
                        </div>

                        <button className='restart-btn' onClick={handleRestart}>Restart</button>
                    </div>
                </>
            )}

            {gameOver && (
                <>
                    <div className='end-results'>
                        <h2>Time Ended!</h2>

                        <div className='end-score'>
                            <span>You typed at a speed of <span className='result-lvl'>{wordStatus.filter(s => s === 'correct').length}WPM!</span> </span>
                            <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                        </div>

                        <div className='result'>
                            <span className='res-streak'>Streak Multiplier</span>
                            <span className='res-streak'>x{multiplier}</span>
                        </div>

                        <div className='result'>
                            <span className='ts-res'>Words Typed</span>
                            <span className='ts-res'>{currentIndex}</span>
                        </div>

                        <div className='result'>
                            <span className='ts-res'>Accuracy</span>
                            <span className='ts-res'>{currentIndex > 0 ? Math.round((wordStatus.filter(s => s === 'correct').length / currentIndex) * 100) : 0}%</span>
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

                        <button className='play-again-2' onClick={handleRestart}>Play Again</button>
                    </div>
                </>
            )}
        </div>
    )
}

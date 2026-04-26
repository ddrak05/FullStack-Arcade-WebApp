import {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/rockPaperScissors.css';

const CHOICES = ['🪨', '📄', '✂️']

function getAiChoice () {
    return CHOICES[Math.floor(Math.random() * CHOICES.length)];
}

function getResult(player, ai) {
    if (player === ai) return 'tie';
    if (
        (player === '🪨' && ai === '✂️') ||
        (player === '📄' && ai === '🪨') ||
        (player === '✂️' && ai === '📄')
    ) return 'win';
    return 'loss';
}

export default function RockPaperScissors() {

    const navigate = useNavigate();
    const {user, token, refreshToken} = useAuth();

    const [userChoice, setUserChoice] = useState(null);
    const [aiChoice, setAiChoice] = useState(null);
    const [score, setScore] = useState({player: 0, ties: 0, ai: 0})
    const [isWaiting, setIsWaiting] = useState(false);

    const [rounds, setRounds] = useState([]);
    const [gameOver, setGameOver] = useState(false);
    const [unlocked, setUnlocked] = useState([]);
    const [xpEarned, setXpEarned] = useState(0);

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    async function saveScore(score){
        try{
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/rock-paper-scissors', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    wins: score.player,
                    draws: score.ties,
                    losses: score.ai,
                    outcome: getGameResult(score),
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp)
            setUnlocked(data.achievementUnlocked)
        } catch (err) {
            console.error(err);
        }
    }

    const historyRef = useRef(null);

    useEffect(() => {
        if (historyRef.current) {
            historyRef.current.scrollTop = 0;
        }
    }, [rounds]);

    const handleChoice = async (choice) => {
        if (isWaiting) return;
        setIsWaiting(true);

        const ai = getAiChoice()
        const result = getResult(choice, ai)

        setUserChoice(choice);

        await new Promise(resolve => setTimeout(resolve, 800));
        setAiChoice(ai);

        const newScore = {...score};
        if (result === 'win') newScore.player++;
        else if (result === 'tie') newScore.ties++;
        else newScore.ai++;
        setScore(newScore);

        // Update rounds
        setRounds(prev => [...prev, {player: choice, ai, result}])

        // Check if someone reached 5 wins
        if (newScore.player >= 5 || newScore.ai >= 5) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setGameOver(true);
            saveScore(newScore);
        }

        setIsWaiting(false);
    }

    const handlePlayAgain = () => {
        setUserChoice(null);
        setAiChoice(null);
        setScore({player: 0, ties: 0, ai: 0});
        setRounds([]);
        setGameOver(false);
        setUnlocked([])
        historyRef.current = 0;
    }

    function getGameResult(score) {
        if(score.player > score.ai) return 'Won';
        else return 'Lost';
    }

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={() => navigate('/')}>Back</button>
                <h1>Rock Paper Scissors</h1>
                {!gameOver && <p>First to 5 wins!</p>}
            </div>

            {!gameOver && (
                <>
                    <div className='game-area'>
                        <div className='side'>
                            <span className='side-label'>{user.username.toUpperCase()}</span>
                            <div className='choice-display'>
                                <div className='choices'>
                                    {CHOICES.map((choice, i) => (
                                        <button key={i} className='choice-btn' onClick={() => handleChoice(choice)}>
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                                <span className='current-choice'>{userChoice || '?'}</span>
                            </div>
                        </div>

                        <div className='middle'>
                            <div className='rps-scoreboard'>
                                <div className='rps-score-box'>
                                    <span className='rps-score-label'>YOU</span>
                                    <span className='rps-score-num'>{score.player}</span>
                                </div>
                                <div className='rps-score-box'>
                                    <span className='rps-score-label'>TIES</span>
                                    <span className='rps-score-num'>{score.ties}</span>
                                </div>
                                <div className='rps-score-box'>
                                    <span className='rps-score-label'>AI</span>
                                    <span className='rps-score-num'>{score.ai}</span>
                                </div>
                            </div>

                            <div className='history' ref={historyRef}>
                                {[...rounds].slice(-5).reverse().map((round, i) => (
                                    <div key={i} className='round-row'>
                                        <span className='round-num'>Round {Math.min(rounds.length) - i}</span>
                                        <span className='round-icon'>
                                    {round.result === 'win' ? '✅' :
                                        round.result === 'tie' ? '🤝' : '❌'}
                                </span>
                                        <span>{round.player} - {round.ai}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className='side'>
                            <span className='side-label'>AI</span>
                            <div className='choice-display'>
                                <div className='choices'>
                                    {CHOICES.map((choice, i) => (
                                        <button key={i} className='choice-btn disabled'>
                                            {choice}
                                        </button>
                                    ))}
                                </div>
                                <span className='current-choice'>{aiChoice || '?'}</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {gameOver && (
                <div className='end-results'>
                    <h2>Game Over!</h2>

                    <div className='end-score'>
                        <span>You <span className={`outcome ${getGameResult(score)}`}>{getGameResult(score)}</span>!</span>
                        <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                    </div>

                    <div className='result'>
                        <span className='res-streak'>Streak Multiplier</span>
                        <span className='res-streak'>x{multiplier}</span>
                    </div>

                    <div className='result'>
                        <span>Record ({score.player + score.ties + score.ai} Rounds)</span>
                        <span>{score.player}W - {score.ties}D - {score.ai}L</span>
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
            )}
        </div>
    )
}
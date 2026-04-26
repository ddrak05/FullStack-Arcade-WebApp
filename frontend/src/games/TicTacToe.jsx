import {useState, useRef, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext.jsx';
import '../styles/games/tictactoe.css';

// Winning Combinations
const WINNING_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]
]

function checkWinner(board){
    for (let combo of WINNING_COMBOS){
        const [a, b, c] = combo;
        if(board[a] && board[a] === board[b] && board[a] === board[c]){
            return board[a] === 'X' ? 'Player' : 'AI';
        }
    }
}

function getMove(board){
    // 10% chance the AI makes a mistake and just picks a random spot
    const difficulty = 0.9;
    if (Math.random() > difficulty) {
        const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null);
        return available[Math.floor(Math.random() * available.length)];
    }

    // Helper to shuffle arrays
    const shuffle = (array) => array.sort(() => Math.random() - 0.5);

    // 1. Win if possible
    for (let combo of WINNING_COMBOS){
        const [a, b, c] = combo;
        const cells = [board[a], board[b], board[c]];

        if(cells.filter(c => c === 'O').length === 2 && cells.includes(null)) {
            return combo[cells.indexOf(null)];
        }
    }

    // 2. Block player from winning
    for (let combo of WINNING_COMBOS){
        const[a, b, c] = combo;
        const cells = [board[a], board[b], board[c]];

        if(cells.filter(c => c === 'X').length === 2 && cells.includes(null)) {
            return combo[cells.indexOf(null)];
        }
    }

    // 3. If player has opposite corners take a side
    const oppositeCorners = (board[0] === 'X' && board[8] === 'X') || (board[2] === 'X' && board[6] === 'X')
    if (oppositeCorners && board[4] === 'O') {
        const edges = shuffle([1, 3, 5, 7])
        const freeEdge = edges.find(i => !board[i])
        if (freeEdge !== undefined) return freeEdge
    }

    // 4. Create or Block a Fork
    const findFork = (player) => {
        for (let i=0; i<9; i++) {
            if(board[i] === null) {
                let tempBoard = [...board];
                tempBoard[i] = player;
                let winningOpp = 0;
                for (let combo of WINNING_COMBOS) {
                    const [a, b, c] = combo;
                    const cells = [tempBoard[a], tempBoard[b], tempBoard[c]]
                    if (cells.filter(c => c === player).length === 2 && cells.includes(null)) {
                        winningOpp++;
                    }
                }
                if (winningOpp >= 2) return i;
            }
        }
        return null;
    }

    const aiFork = findFork('O')
    if (aiFork !== null) return aiFork;

    const playerFork = findFork('X');
    if (playerFork !== null) return playerFork;

    // 5. Take Center if available
    if (!board[4]) return 4;

    // 6. Take a Random corner
    const corners = shuffle([0, 2, 6, 8]);
    const freeCorner = corners.find(i => !board[i])
    if(freeCorner !== undefined) return freeCorner;

    // 7. Take a Random Side
    const edges = shuffle([1, 3, 5, 7])
    const freeEdge = edges.find(i => !board[i])
    if (freeEdge !== undefined) return freeEdge;

    // 8. Take any remaining cell
    return board.indexOf(null);
}

export default function TicTacToe() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [score, setScore] = useState({player: 0, draw: 0, ai: 0});
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [unlocked, setUnlocked] = useState([])
    const [gameOver, setGameOver] = useState(false);
    const [xpEarned, setXpEarned] = useState(0)

    // Winner of current round: 'X', 'O', 'draw' or null
    const [roundWinner, setRoundWinner] = useState(null);

    const navigate = useNavigate()
    const {user, token, refreshToken} = useAuth();

    // Streak Multiplier
    const multiplier = parseFloat((1 + ((user.streak - 1) * 0.1)).toFixed(1));

    const scoreRef = useRef({player: 0, draw: 0, ai: 0});
    useEffect(() => {
        scoreRef.current = score;
    }, [score]);

    useEffect(() => {
        return () => {
            const s = scoreRef.current;
            if (s.player === 0 && s.draw === 0 && s.ai === 0) return ;
        }
    }, []);

    // Connect to Database
    const handleExit = async () => {
        // No games played - dont save score
        if (score.player === 0 && score.draw === 0 && score.ai === 0) return navigate('/');

        try{
            setGameOver(true);
            refreshToken();
            const response = await fetch('http://localhost:3000/api/scores/tic-tac-toe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    wins: score.player,
                    draws: score.draw,
                    losses: score.ai,
                    multiplier: multiplier
                })
            })
            const data = await response.json();
            setXpEarned(data.final_xp)

            if (data.achievementUnlocked && data.achievementUnlocked.length > 0) {
                setUnlocked(data.achievementUnlocked);
                setGameOver(true);
            }
        } catch (err) {
            console.error('Failed to save score', err);
        }
    }

    const getResult = () => {
        if (score.player > score.ai) return 'Won';
        if (score.player === score.ai) return 'Drew';
        return 'Lost';
    }

    const handleClick = (index) => {
        // Ignore if cell taken, not player's turn, or round over
        if(board[index] || !isPlayerTurn || roundWinner) return;

        // Player Places X
        const newBoard = [...board];
        newBoard[index] = 'X';

        // Check if player won or drew
        const playerWinner = checkWinner(newBoard);
        const playerDraw = !playerWinner && newBoard.every(cell => cell);

        if (playerWinner || playerDraw) {
            setBoard(newBoard);
            setRoundWinner(playerWinner || 'Draw');
            if (playerWinner === 'Player') setScore({ player: score.player + 1, draw: score.draw, ai: score.ai });
                else setScore({player: score.player, draw: score.draw + 1, ai: score.ai});
            return;
        }

        // AI Places O
        setBoard(newBoard);
        setIsPlayerTurn(false);

        setTimeout(() => {
            const aiMove = getMove(newBoard);
            newBoard[aiMove] = 'O';

            const aiWinner = checkWinner(newBoard);
            const aiDraw = !aiWinner && newBoard.every(cell => cell);

            setBoard(newBoard);
            if (aiWinner || aiDraw) {
                setRoundWinner(aiWinner || 'Draw');
                if (aiWinner === 'AI') setScore({ player: score.player, draw: score.draw, ai: score.ai + 1 });
                    else setScore({player: score.player, draw: score.draw + 1, ai: score.ai});
            } else {
                setIsPlayerTurn(true);
            }
        }, 1500);
    }

    const resetBoard = () => {
        setBoard(Array(9).fill(null));
        setRoundWinner(null);
        setIsPlayerTurn(true);
    }

    const getWinner = (winner) => {
        if (winner === 'Player') return 'ttt-result win';
        if (winner === 'AI') return 'ttt-result loss';
        return 'ttt-result draw';
    }

    return (
        <div className='game-page'>
            <div className='game-header'>
                <button className='back' onClick={handleExit}>Back</button>
                <h1>Tic-Tac-Toe</h1>
                {!gameOver && <p>Session ends when you click Finish & Save</p>}

                {!gameOver && (
                    <div className="game-content">
                        <div className='info'>
                            <span>Score {score.player} - {score.ai}</span>
                            <span>{isPlayerTurn ? 'Player' : 'Computer'}'s Turn</span>
                        </div>

                        <div className='ttt-turn'>
                            {}
                        </div>

                        <div className='ttt-board'>
                            {board.map((cell, i) => (
                                <div
                                    key={i}
                                    className={`ttt-cell ${cell === 'X' ? 'x' : cell === 'O' ? 'o' : ''}`}
                                    onClick={() => !roundWinner && handleClick(i)}
                                >
                                    {cell}
                                </div>
                            ))}
                        </div>

                        {roundWinner && (
                            <button className='play-again-2' onClick={resetBoard}>Next Round</button>
                        )}

                        <button className='finish-btn' onClick={handleExit} style={{marginTop: '20px'}}>
                            Finish & Save
                        </button>
                    </div>
                )}

                {gameOver && (
                    <>
                        <div className='end-results ttt'>
                            <h2>Game Over!</h2>

                            <div className='end-score'>
                                <span>You <span className={`outcome ${getResult()}`}>{getResult()}</span>!</span>
                                <span><span className='result-xp'>+{xpEarned}</span> XP earned!</span>
                            </div>

                            <div className='result'>
                                <span className='res-streak'>Streak Multiplier</span>
                                <span className='res-streak'>x{multiplier}</span>
                            </div>

                            <div className='result'>
                                <span>Record ({score.player + score.draw + score.ai} Rounds)</span>
                                <span>{score.player}W - {score.draw}D - {score.ai}L</span>
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

                            <button className='play-again-2' onClick={() => navigate('/')}>
                                Back to Menu
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
import {useAuth} from '../context/AuthContext.jsx';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import '../styles/achievements.css';

export default function Achievements() {
    const {token, refreshToken} = useAuth();
    const navigate = useNavigate();

    const [achievements, setAchievements] = useState([]);
    const [progress, setProgress] = useState([]);

    // Unlocked Achievements
    const unlockedIds = achievements
        .filter(ach => ach.unlocked_at !== null)
        .map(ach => ach.id);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAchievements();
    }, [])

    async function fetchAchievements() {
        try {
            refreshToken()
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/achievements/fetch', {
                headers: {'Authorization' : `Bearer ${token}`}
            })
            const data = await response.json();
            setAchievements(data.rows);
            setProgress(data.progress);
        } catch(err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Determine which achievements will be shown
    const visibleAchievements = achievements.filter(ach => {
        // 1. Show not stacked achievements
        if (!ach.connected_to && !achievements.some(a => a.connected_to === ach.name)) {
            return true;
        }

        // 2. If this achievement is unlocked and there is another tier, hide it
        const nextTier = achievements.find(a => a.connected_to === ach.name)
        if (ach.unlocked_at !== null && nextTier) {
            return false;
        }

        // 3. If this achievement is locked, show it only if the one its connected_to is unlocked
        if (ach.unlocked_at === null) {
            if (!ach.connected_to) return true;
            const connected_to = achievements.find(a => a.name === ach.connected_to)
            return connected_to && connected_to.unlocked_at !== null
        }

        // 4. Show it if it's the end of the stack and unlocked
        return true;
    })

    // Achievement Type
    const generalAchievements = visibleAchievements.filter(ach => ach.category === 'General');
    const reactionAchievements = visibleAchievements.filter(ach => ach.category === 'Reaction Time');
    const sequenceAchievements = visibleAchievements.filter(ach => ach.category === 'Sequence Memory');
    const numberAchievements = visibleAchievements.filter(ach => ach.category === 'Number Memory');
    const verbalAchievements = visibleAchievements.filter(ach => ach.category === 'Verbal Memory');
    const visualAchievements = visibleAchievements.filter(ach => ach.category === 'Visual Memory');
    const typingAchievements = visibleAchievements.filter(ach => ach.category === 'Typing Speed');
    const rpsAchievements = visibleAchievements.filter(ach => ach.category === 'Rock Paper Scissors');
    const tttAchievements = visibleAchievements.filter(ach => ach.category === 'Tic-Tac-Toe');
    const wordleAchievements = visibleAchievements.filter(ach => ach.category === 'Wordle');
    const mathsAchievements = visibleAchievements.filter(ach => ach.category === 'Quick Maths')

    const getDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = String(date.getFullYear()).slice(-2);
        return `(Earned at: ${d}/${m}/${y})`;
    };

    if (loading) return <div className='ach-page'>Loading ... </div>

    // Render group of achievements by category
    const renderGrid = (title, list) => {
        return (
            <div className='ach-section'>
                <h2 className='ach-title'>{title}</h2>
                <div className='ach-grid'>
                    {list.map((a) => {
                        const isUnlocked = unlockedIds.includes(a.id);
                        const tier = a.tier ? a.tier.toLowerCase() : 'none';

                        // Get achievements it's connected to
                        const prevTier = a.connected_to
                            ? achievements.find(ach => ach.name === a.connected_to)
                            : null;
                        const bronzeTier = (prevTier && prevTier.connected_to)
                            ? achievements.find(ach => ach.name === prevTier.connected_to)
                            : null;

                        return (
                            <div key={a.id}
                                 className={`ach-card ${isUnlocked ? 'unlocked' : 'locked'} ${tier}`}
                                 data-tooltip={`${a.description} ${!isUnlocked ? progress[a.id] : getDate(a.unlocked_at)}`}
                            >
                                <p className='ach-emoji'>{a.emoji}</p>
                                <div className='ach-info'>
                                    <h3>{a.name}</h3>
                                    <span className='status'>
                                        {isUnlocked ? '✅ Unlocked' : `🎯 ${a.xp_reward} XP`}
                                    </span>
                                </div>

                                {bronzeTier && (
                                    <div className={`prev-ach2 bronze`}
                                         data-completed={`Bronze Tier: ${bronzeTier.name} Completed ✅ ${getDate(bronzeTier.unlocked_at)}`}
                                    >
                                        <span className='prev-emoji'>{bronzeTier.emoji}</span>
                                        <span className='tick'>✔️</span>
                                    </div>
                                )}
                                {prevTier && (
                                    <div className={`prev-ach ${prevTier.tier.toLowerCase()}`}
                                         data-completed={`${prevTier.tier} Tier: ${prevTier.name} Completed ✅ ${getDate(prevTier.unlocked_at)}`}
                                    >
                                        <span className='prev-emoji'>{prevTier.emoji}</span>
                                        <span className='tick'>✔️</span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div className='ach-page'>
            <div className='ach-header'>
                <button className='back' onClick={() => navigate(-1)}>Back</button>
                <h1>Achievements Room</h1>
                <p>{unlockedIds.length}/{achievements.length} Achievements Unlocked</p>
            </div>

            {renderGrid('General Milestones', generalAchievements)}
            {renderGrid('Reaction Time Trophies', reactionAchievements)}
            {renderGrid('Sequence Memory Trophies', sequenceAchievements)}
            {renderGrid('Number Memory Trophies', numberAchievements)}
            {renderGrid('Verbal Memory Trophies', verbalAchievements)}
            {renderGrid('Visual Memory Trophies', visualAchievements)}
            {renderGrid('Typing Speed Trophies', typingAchievements)}
            {renderGrid('Quick Maths Trophies', mathsAchievements)}
            {renderGrid('Rock Paper Scissors Trophies', rpsAchievements)}
            {renderGrid('Tic Tac Toe Trophies', tttAchievements)}
            {renderGrid('Wordle Trophies', wordleAchievements)}
            {renderGrid('More Soon ... ', [])}
        </div>

    )
}
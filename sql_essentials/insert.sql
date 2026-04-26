USE arcadedb;

-- Games
INSERT INTO games (name, description, category, emoji, path) VALUES
('Reaction Time', 'Test your Visual Reflexes', 'Benchmark', '⚡', '/games/reaction-time'),
('Sequence Memory', 'Remember an increasingly long pattern of button presses', 'Benchmark', '🧠', '/games/sequence-memory'),
('Number Memory', 'Remember the longest number you can', 'Benchmark', '🔢', '/games/number-memory'),
('Verbal Memory', 'Keep as many words in short term memory as possible', 'Benchmark', '📝', '/games/verbal-memory'),
('Visual Memory', 'Remember an increasingly large board of squares', 'Benchmark', '💫', '/games/visual-memory'),
('Typing Speed', 'How fast can you type?', 'Benchmark', '⌨️', '/games/typing-speed'),
('Rock Paper Scissors', 'Classic hand game', 'Arcade', '✂️', '/games/rock-paper-scissors'),
('Tic-Tac-Toe', 'Classic two player game', 'Arcade', '❌', '/games/tic-tac-toe'),
('Wordle', 'Guess the hidden 5-letter word', 'Arcade', '🔡', '/games/wordle'),
('Quick Maths', 'Solve arithmetic problems as fast as possible', 'Benchmark', '➕', '/games/quick-maths');

-- Achievements per category

-- ==========================================
-- 0. General Achievements 
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, connected_to) VALUES
('Welcome!', 'Create an account!', 'General', 'Gold', '🆕', 100, 'signup', 1, NULL),
('Getting Warm', 'Play 50 total games', 'General', 'Bronze', '🥉', 50, 'global_count', 50, NULL),
('Dedicated', 'Play 200 total games', 'General', 'Silver', '🥈', 150, 'global_count', 200, 'Getting Warm'),
('Life? What is that?', 'Play 1,000 total games', 'General', 'Gold', '🥇', 500, 'global_count', 1000, 'Dedicated'),

('Novice', 'Reach Player Level 10', 'General', 'Bronze', '🎖️', 50, 'global_level', 10, NULL),
('Expert', 'Reach Player Level 30', 'General', 'Silver', '🥈', 150, 'global_level', 30, 'Novice'),
('Grandmaster', 'Reach Player Level 100', 'General', 'Gold', '👑', 500, 'global_level', 100, 'Expert'),

('Diverse Palette', 'Play every game at least once', 'General', 'Bronze', '🎨', 50, 'all_games_milestone', 1, NULL),
('Jack of All Trades', 'Play every game at least 50 times', 'General', 'Silver', '🃏', 150, 'all_games_milestone', 50, 'Diverse Palette'),
('Completionist', 'Play every game at least 100 times', 'General', 'Gold', '🏆', 500, 'all_games_milestone', 100, 'Jack of All Trades'),

('The Daily 10', 'Play every single game once within 24 hours', 'General', 'Silver', '📅', 150, 'daily_marathon', 8, NULL),
('Obsessed', 'Play 100 games in a single day', 'General', 'Gold', '👁️', 500, 'global_count', 100, NULL);

-- ==========================================
-- 1. Reaction Time Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Reaction Rookie', 'Complete 1 Reaction Time test', 'Reaction Time', 'Bronze', '⏱️', 50, 'game_count', 1, 1, NULL),
('Regular Reflector', 'Play 50 games of Reaction Time', 'Reaction Time', 'Silver', '🥈', 150, 'game_count', 50, 1, 'Reaction Rookie'),
('Reflex Addict', 'Play 100 games of Reaction Time', 'Reaction Time', 'Gold', '🥇', 500, 'game_count', 100, 1, 'Regular Reflector'),

('Decent Reflexes', 'Get an average under 400ms', 'Reaction Time', 'Bronze', '🐢', 50, 'time_under', 400, 1, NULL),
('Lightning Reflexes', 'Get an average under 250ms', 'Reaction Time', 'Silver', '⚡', 150, 'time_under', 250, 1, 'Decent Reflexes'),
('Godlike Speed', 'Get an average under 150ms', 'Reaction Time', 'Gold', '🏎️', 500, 'time_under', 150, 1, 'Lightning Reflexes'),

('Quick Trigger', 'Get a single try below 150ms', 'Reaction Time', 'Bronze', '🔫', 50, 'try_condition', 150, 1, NULL),
('Snap Decision', 'Get a single try below 130ms', 'Reaction Time', 'Silver', '🎯', 150, 'try_condition', 130, 1, 'Quick Trigger'),
('Cheater?', 'Get a single try below 100ms', 'Reaction Time', 'Gold', '🤖', 500, 'try_condition', 100, 1, 'Snap Decision'),

('Double Tap', 'Get 2 tries below 150ms in one game', 'Reaction Time', 'Bronze', '👥', 50, 'try_repeat', 1, 1, NULL),
('Consistent Speed', 'Get 2 tries below 150ms in 5 different games', 'Reaction Time', 'Silver', '🔄', 150, 'try_repeat', 5, 1, 'Double Tap'),
('The Untouchable', 'Get 2 tries below 150ms in 15 different games', 'Reaction Time', 'Gold', '🏆', 500, 'try_repeat', 15, 1, 'Consistent Speed');

-- ==========================================
-- 2. Sequence Memory Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Pattern Apprentice', 'Complete 1 Sequence Memory game', 'Sequence Memory', 'Bronze', '👶', 50, 'game_count', 1, 2, NULL),
('Pattern Addict', 'Play 50 games of Sequence Memory', 'Sequence Memory', 'Silver', '🔁', 150, 'game_count', 50, 2, 'Pattern Apprentice'),
('Neural Master', 'Play 100 games of Sequence Memory', 'Sequence Memory', 'Gold', '🧬', 500, 'game_count', 100, 2, 'Pattern Addict'),

('Memorizer', 'Reach Level 10', 'Sequence Memory', 'Bronze', '🧠', 50, 'level_reached', 10, 2, NULL),
('Human Computer', 'Reach Level 50', 'Sequence Memory', 'Silver', '🖥️', 150, 'level_reached', 50, 2, 'Memorizer'),
('Deep Mind', 'Reach Level 100', 'Sequence Memory', 'Gold', '🌌', 500, 'level_reached', 100, 2, 'Human Computer'),

('Consistent Recall', 'Reach Level 15 five different times', 'Sequence Memory', 'Bronze', '🔑', 50, 'level_repeat', 5, 2, NULL),
('Memory Machine', 'Reach Level 15 twenty different times', 'Sequence Memory', 'Silver', '⚙️', 150, 'level_repeat', 20, 2, 'Consistent Recall'),
('Pattern Legend', 'Reach Level 25 ten different times', 'Sequence Memory', 'Gold', '🏆', 500, 'level_repeat', 10, 2, 'Memory Machine'),

('Double Take', 'Reach Level 20 two games in a row', 'Sequence Memory', 'Bronze', '👥', 50, 'streak_milestone', 20, 2, NULL),
('Pattern Perfection', 'Reach Level 25 two games in a row', 'Sequence Memory', 'Silver', '✨', 150, 'streak_milestone', 25, 2, 'Double Take'),
('The Unforgettable', 'Reach Level 30 three games in a row', 'Sequence Memory', 'Gold', '💎', 500, 'streak_milestone', 30, 2, 'Pattern Perfection');

-- ==========================================
-- 3. Number Memory Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Digit Rookie', 'Complete 1 Number Memory game', 'Number Memory', 'Bronze', '🔢', 50, 'game_count', 1, 3, NULL),
('Numeric Regular', 'Play 50 games of Number Memory', 'Number Memory', 'Silver', '🥈', 150, 'game_count', 50, 3, 'Digit Rookie'),
('Centurion of Digits', 'Play 100 games of Number Memory', 'Number Memory', 'Gold', '🥇', 500, 'game_count', 100, 3, 'Numeric Regular'),

('Lucky Seven', 'Remember a 7-digit number', 'Number Memory', 'Bronze', '🍀', 50, 'digits_reached', 7, 3, NULL),
('Deca-Digit', 'Remember a 10-digit number', 'Number Memory', 'Silver', '🔟', 150, 'digits_reached', 10, 3, 'Lucky Seven'),
('Phone Book', 'Remember a 15-digit number', 'Number Memory', 'Gold', '📞', 500, 'digits_reached', 15, 3, 'Deca-Digit'),

('Seven-Sevens', 'Remember a 7-digit number 7 different times', 'Number Memory', 'Bronze', '🎰', 50, 'digit_repeat', 7, 3, NULL),
('Perfect Ten', 'Remember a 10-digit number 10 different times', 'Number Memory', 'Silver', '🎯', 150, 'digit_repeat', 10, 3, 'Seven-Sevens'),
('The Dozen', 'Remember a 12-digit number 12 different times', 'Number Memory', 'Gold', '💎', 500, 'digit_repeat', 12, 3, 'Perfect Ten'),

('Triple Seven', 'Remember a 7-digit number 3 games in a row', 'Number Memory', 'Bronze', '🔄', 50, 'digit_streak', 7, 3, NULL),
('Consistency King', 'Remember a 10-digit number 3 games in a row', 'Number Memory', 'Silver', '👑', 150, 'digit_streak', 10, 3, 'Triple Seven'),
('Numerical God', 'Remember a 12-digit number 5 games in a row', 'Number Memory', 'Gold', '🤖', 500, 'digit_streak', 12, 3, 'Consistency King');

-- ==========================================
-- 4. Verbal Memory Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Word Starter', 'Complete 1 Verbal Memory game', 'Verbal Memory', 'Bronze', '👋', 50, 'game_count', 1, 4, NULL),
('Linguist', 'Play 50 games of Verbal Memory', 'Verbal Memory', 'Silver', '🗣️', 150, 'game_count', 50, 4, 'Word Starter'),
('Polyglot', 'Play 100 games of Verbal Memory', 'Verbal Memory', 'Gold', '🌍', 500, 'game_count', 100, 4, 'Linguist'),

('Vocabulary Builder', 'Score 20 points in a single game', 'Verbal Memory', 'Bronze', '🏫', 50, 'verbal_score', 20, 4, NULL),
('Bookworm', 'Score 50 points in a single game', 'Verbal Memory', 'Silver', '📚', 150, 'verbal_score', 50, 4, 'Vocabulary Builder'),
('The Human Lexicon', 'Score 100 points in a single game', 'Verbal Memory', 'Gold', '🧙‍♂️', 500, 'verbal_score', 100, 4, 'Bookworm'),

('Word Collector', 'Identify 200 total words across all time', 'Verbal Memory', 'Bronze', '🧺', 50, 'total_words_seen', 200, 4, NULL),
('Verbal Scholar', 'Identify 500 total words across all time', 'Verbal Memory', 'Silver', '🎓', 150, 'total_words_seen', 500, 4, 'Word Collector'),
('Word Millionaire', 'Identify 1,500 total words across all time', 'Verbal Memory', 'Gold', '💎', 500, 'total_words_seen', 1500, 4, 'Verbal Scholar');

-- ==========================================
-- 5. Visual Memory Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Square One', 'Complete 1 Visual Memory game', 'Visual Memory', 'Bronze', '🟦', 50, 'game_count', 1, 5, NULL),
('Memory Marathon', 'Play 50 games of Visual Memory', 'Visual Memory', 'Silver', '🏃', 150, 'game_count', 50, 5, 'Square One'),
('Century of Sight', 'Play 100 games of Visual Memory', 'Visual Memory', 'Gold', '💯', 500, 'game_count', 100, 5, 'Memory Marathon'),

('Architect', 'Reach a 6x6 grid size', 'Visual Memory', 'Bronze', '🏛️', 50, 'grid_reached', 6, 5, NULL),
('Visionary', 'Reach a 7x7 grid size', 'Visual Memory', 'Silver', '👁️', 150, 'grid_reached', 7, 5, 'Architect'),
('Eagle Eye', 'Reach an 8x8 grid size', 'Visual Memory', 'Gold', '🦅', 500, 'grid_reached', 8, 5, 'Visionary'),

('Master Mason', 'Reach a 6x6 grid size 15 different times', 'Visual Memory', 'Bronze', '🧱', 50, 'grid_repeat', 6, 5, NULL),
('Grid Grinder', 'Reach a 7x7 grid size 15 different times', 'Visual Memory', 'Silver', '⚙️', 150, 'grid_repeat', 7, 5, 'Master Mason'),
('Geometric God', 'Reach an 8x8 grid size 15 different times', 'Visual Memory', 'Gold', '💎', 500, 'grid_repeat', 8, 5, 'Grid Grinder'),

('Full House', 'Clear the entire grid once', 'Visual Memory', 'Gold', '🏠', 500, 'clear_grid', 62, 5, NULL);

-- ==========================================
-- 6. Typing Speed Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('First Words', 'Complete 1 typing test', 'Typing Speed', 'Bronze', '⌨️', 50, 'game_count', 1, 6, NULL),
('Keyboard Warrior', 'Play 50 typing tests', 'Typing Speed', 'Silver', '⚔️', 150, 'game_count', 50, 6, 'First Words'),
('Typewriter Pro', 'Play 100 typing tests', 'Typing Speed', 'Gold', '📜', 500, 'game_count', 100, 6, 'Keyboard Warrior'),

('Steady Hands', 'Finish with 100% accuracy 5 times (Over 30 wpm)', 'Typing Speed', 'Bronze', '🐢', 50, 'accuracy_repeat', 5, 6, NULL),
('Sharpshooter', 'Finish with 100% accuracy 10 times (Over 30 wpm)', 'Typing Speed', 'Silver', '🎯', 150, 'accuracy_repeat', 10, 6, 'Steady Hands'),
('The Surgeon', 'Finish with 100% accuracy 20 times (Over 30 wpm)', 'Typing Speed', 'Gold', '💉', 500, 'accuracy_repeat', 20, 6, 'Sharpshooter'),

('Road Runner', 'Reach 50 WPM', 'Typing Speed', 'Bronze', '🏎️', 50, 'wpm_over', 50, 6, NULL),
('Sonic Boom', 'Reach 80 WPM', 'Typing Speed', 'Silver', '💥', 150, 'wpm_over', 80, 6, 'Road Runner'),
('Typing God', 'Reach 120 WPM', 'Typing Speed', 'Gold', '⚡', 500, 'wpm_over', 120, 6, 'Sonic Boom'),

('Consistent Typist', 'Reach 50 WPM 20 different times', 'Typing Speed', 'Bronze', '🔄', 50, 'wpm_repeat', 50, 6, NULL),
('Lead Hands', 'Reach 65 WPM 20 different times', 'Typing Speed', 'Silver', '⚓', 150, 'wpm_repeat', 65, 6, 'Consistent Typist'),
('Keyboard Master', 'Reach 90 WPM 20 different times', 'Typing Speed', 'Gold', '🎓', 500, 'wpm_repeat', 90, 6, 'Lead Hands'),

('Perfectionist', 'Finish with 100% accuracy and at least 60 WPM', 'Typing Speed', 'Bronze', '💎', 50, 'perfect_speed', 60, 6, NULL),
('Flawless Speed', 'Finish with 100% accuracy and at least 80 WPM', 'Typing Speed', 'Silver', '✨', 150, 'perfect_speed', 80, 6, 'Perfectionist'),
('Divine Accuracy', 'Finish with 100% accuracy and at least 100 WPM', 'Typing Speed', 'Gold', '🏆', 500, 'perfect_speed', 100, 6, 'Flawless Speed');

-- ==========================================
-- 7. Rock Paper Scissors Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Roshambo!', 'Play your first game of RPS', 'Rock Paper Scissors', 'Bronze', '✊', 50, 'game_count', 1, 7, NULL),
('RPS Regular', 'Play 50 games of RPS', 'Rock Paper Scissors', 'Silver', '🧤', 150, 'game_count', 50, 7, 'Roshambo!'),
('Centurion Gambler', 'Play 100 games of RPS', 'Rock Paper Scissors', 'Gold', '💯', 500, 'game_count', 100, 7, 'RPS Regular'),

('Double Luck', 'Get a 2-game winning streak', 'Rock Paper Scissors', 'Bronze', '🍀', 50, 'win_streak', 2, 7, NULL),
('Unstoppable', 'Get a 5-game winning streak', 'Rock Paper Scissors', 'Silver', '🔥', 150, 'win_streak', 5, 7, 'Double Luck'),
('The Oracle', 'Get a 10-game winning streak', 'Rock Paper Scissors', 'Gold', '🔮', 500, 'win_streak', 10, 7, 'Unstoppable'),

('Victor', 'Win 10 games total', 'Rock Paper Scissors', 'Bronze', '🥉', 50, 'total_wins', 10, 7, NULL),
('Veteran Victor', 'Win 30 games total', 'Rock Paper Scissors', 'Silver', '🥈', 150, 'total_wins', 30, 7, 'Victor'),
('Tactician', 'Win 100 games total', 'Rock Paper Scissors', 'Gold', '🥇', 500, 'total_wins', 100, 7, 'Veteran Victor'),

('Clean Sweep', 'Win a game by winning every round', 'Rock Paper Scissors', 'Bronze', '🧹', 50, 'perfect_game_repeat', 1, 7, NULL),
('Master Sweep', 'Win a perfect game 3 different times', 'Rock Paper Scissors', 'Silver', '✨', 150, 'perfect_game_repeat', 3, 7, 'Clean Sweep'),
('Flawless Execution', 'Win a perfect game 10 different times', 'Rock Paper Scissors', 'Gold', '💎', 500, 'perfect_game_repeat', 10, 7, 'Master Sweep');

-- ==========================================
-- 8. Tic Tac Toe Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('X or O?', 'Complete 1 game of Tic-Tac-Toe', 'Tic-Tac-Toe', 'Bronze', '❌', 50, 'game_count', 1, 8, NULL),
('Centurion of the Grid', 'Play 50 games of Tic-Tac-Toe', 'Tic-Tac-Toe', 'Silver', '💯', 150, 'game_count', 50, 8, 'X or O?'),
('Grid Veteran', 'Play 100 games total', 'Tic-Tac-Toe', 'Gold', '👴', 500, 'game_count', 100, 8, 'Centurion of the Grid'),

('Triple Threat', 'Win your first game', 'Tic-Tac-Toe', 'Bronze', '⭕', 50, 'ttt_wins', 1, 8, NULL),
('Terminator', 'Win 50 games total', 'Tic-Tac-Toe', 'Silver', '🤴', 150, 'ttt_wins', 50, 8, 'Triple Threat'),
('Flawless Victory', 'Win 100 games total', 'Tic-Tac-Toe', 'Gold', '✨', 500, 'ttt_wins', 100, 8, 'Terminator'),

('Unbeaten Start', 'Go 2 sessions in a row without losing a single game (Wins/Draws only)', 'Tic-Tac-Toe', 'Bronze', '🛡️', 50, 'invincible_session_streak', 2, 8, NULL),
('Wall of Steel', 'Go 10 sessions in a row without losing a single game', 'Tic-Tac-Toe', 'Silver', '🧱', 150, 'invincible_session_streak', 10, 8, 'Unbeaten Start'),
('The Unbeatable', 'Go 30 sessions in a row without losing a single game', 'Tic-Tac-Toe', 'Gold', '🏰', 500, 'invincible_session_streak', 30, 8, 'Wall of Steel'),

('Winner\'s Circle', 'Complete 5 sessions winning every single game', 'Tic-Tac-Toe', 'Bronze', '🔥', 50, 'perfect_session_streak', 5, 8, NULL),
('Grandmaster Streak', 'Complete 10 sessions winning every single game', 'Tic-Tac-Toe', 'Silver', '🏅', 150, 'perfect_session_streak', 10, 8, 'Winner\'s Circle'),
('Divine Ruler', 'Complete 20 sessions winning every single game', 'Tic-Tac-Toe', 'Gold', '👑', 500, 'perfect_session_streak', 20, 8, 'Grandmaster Streak');

-- ==========================================
-- 9. Wordle Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Wordle Rookie', 'Complete 1 game of Wordle', 'Wordle', 'Bronze', '🔡', 50, 'game_count', 1, 9, NULL),
('Wordle Regular', 'Play 50 games of Wordle', 'Wordle', 'Silver', '🥈', 150, 'game_count', 50, 9, 'Wordle Rookie'),
('Wordle Veteran', 'Play 100 games of Wordle', 'Wordle', 'Gold', '🥇', 500, 'game_count', 100, 9, 'Wordle Regular'),

('Solid Four', 'Find a word in 4 tries 10 different times', 'Wordle', 'Bronze', '🍀', 100, 'wordle_repeat', 4, 9, NULL),
('Thrice as Nice', 'Find a word in 3 tries 10 different times', 'Wordle', 'Silver', '🥉', 250, 'wordle_repeat', 3, 9, 'Solid Four'),
('Dynamic Duo', 'Find a word in 2 tries 10 different times', 'Wordle', 'Gold', '🥈', 500, 'wordle_repeat', 2, 9, 'Thrice as Nice'),

('First Time Lucky', 'Find the word in exactly 1 try', 'Wordle', 'Gold', '🎰', 1000, 'one_shot', 1, 9, NULL),

('Deja Vu', 'Find the same target word 2 different times', 'Wordle', 'Gold', '🧠', 500, 'deja_vu', 2, 9, NULL),

('On a Roll', 'Find 10 words in a row without losing', 'Wordle', 'Bronze', '🔥', 200, 'win_streak', 10, 9, NULL),
('Word Streak', 'Find 20 words in a row without losing', 'Wordle', 'Silver', '⚡', 500, 'win_streak', 20, 9, 'On a Roll'),
('Lexical Legend', 'Find 50 words in a row without losing', 'Wordle', 'Gold', '🏆', 1500, 'win_streak', 50, 9, 'Word Streak'),

('Last Second Save', 'Find 10 words on the 6th try', 'Wordle', 'Silver', '⏱️', 300, 'clutch_save', 10, 9, NULL),
('The Final Word', 'Find 20 words on the 6th try', 'Wordle', 'Gold', '💎', 750, 'clutch_save', 20, 9, 'Last Second Save');

-- ==========================================
-- 10. Quick Maths Achievements
-- ==========================================
INSERT INTO achievements (name, description, category, tier, emoji, xp_reward, requirement_type, requirement_value, games_id, connected_to) VALUES
('Mathlete Starter', 'Complete 1 Quick Maths game', 'Quick Maths', 'Bronze', '➕', 50, 'game_count', 1, 10, NULL),
('Number Cruncher', 'Play 50 games of Quick Maths', 'Quick Maths', 'Silver', '🥈', 150, 'game_count', 50, 10, 'Mathlete Starter'),
('Calculator Brain', 'Play 100 games of Quick Maths', 'Quick Maths', 'Gold', '🥇', 500, 'game_count', 100, 10, 'Number Cruncher'),

('Quick & Correct', 'Score 15+ points with over 80% accuracy', 'Quick Maths', 'Bronze', '🎯', 100, 'score_accuracy_combo', 1, 10, NULL),
('Precision Speed', 'Score 15+ points with over 80% accuracy 10 times', 'Quick Maths', 'Silver', '🏹', 250, 'score_accuracy_combo', 10, 10, 'Quick & Correct'),
('Mathematical Sniper', 'Score 15+ points with over 80% accuracy 20 times', 'Quick Maths', 'Gold', '🦅', 500, 'score_accuracy_combo', 20, 10, 'Precision Speed'),

('Pure Ten', 'Score 10+ points with 100% accuracy', 'Quick Maths', 'Bronze', '💯', 100, 'perfect_accuracy_min', 1, 10, NULL),
('Flawless Arithmetic', 'Score 10+ points with 100% accuracy 5 times', 'Quick Maths', 'Silver', '✨', 250, 'perfect_accuracy_min', 5, 10, 'Pure Ten'),
('The Human Abacus', 'Score 10+ points with 100% accuracy 15 times', 'Quick Maths', 'Gold', '💎', 500, 'perfect_accuracy_min', 15, 10, 'Flawless Arithmetic'),

('Decimal Decathlon', 'Reach a score of 10', 'Quick Maths', 'Bronze', '🔟', 50, 'score_reached', 10, 10, NULL),
('Vigorous Variables', 'Reach a score of 20', 'Quick Maths', 'Silver', '🚀', 150, 'score_reached', 20, 10, 'Decimal Decathlon'),
('Alge-Bro', 'Reach a score of 30', 'Quick Maths', 'Gold', '👑', 500, 'score_reached', 30, 10, 'Vigorous Variables'),

('Consistent Adder', 'Get over 12 points 3 games in a row', 'Quick Maths', 'Bronze', '🔥', 100, 'score_streak', 3, 10, NULL),
('Math Marathoner', 'Get over 12 points 5 games in a row', 'Quick Maths', 'Silver', '🏃', 250, 'score_streak', 5, 10, 'Consistent Adder'),
('Infinite Logic', 'Get over 12 points 10 games in a row', 'Quick Maths', 'Gold', '🌌', 500, 'score_streak', 10, 10, 'Math Marathoner'),

('Millionaire Mindset', 'Identify 1,000 total correct answers across all time', 'Quick Maths', 'Gold', '💰', 1000, 'total_correct_answers', 1000, 10, NULL);

-- AVATARS

-- Free Default Avatars
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('⚡', 1, NULL), ('🎯', 1, NULL), ('🔥', 1, NULL), ('🧬', 1, NULL), ('🚀', 1, NULL);

-- General Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🆕', 1, 'Welcome!'),
('🥇', 0, 'Life? What is that?'),
('👑', 0, 'Grandmaster'),
('🏆', 0, 'Completionist'),
('👁️', 0, 'Obsessed');

-- Reaction Time Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🏎️', 0, 'Godlike Speed'),
('🤖', 0, 'Cheater?'),
('🏅', 0, 'The Untouchable');

-- Sequence Memory Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🌌', 0, 'Deep Mind'),
('💎', 0, 'The Unforgettable'),
('🔱', 0, 'Pattern Legend');

-- Number Memory Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('📞', 0, 'Phone Book'),
('🎰', 0, 'The Dozen'),
('🦾', 0, 'Numerical God');

-- Verbal Memory Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🌍', 0, 'Polyglot'),
('🧙‍♂️', 0, 'The Human Lexicon'),
('📚', 0, 'Word Millionaire');

-- Visual Memory Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('💯', 0, 'Century of Sight'),
('🦅', 0, 'Eagle Eye'),
('📐', 0, 'Geometric God'),
('🏠', 0, 'Full House');

-- Typing Speed Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('📜', 0, 'Typewriter Pro'),
('💉', 0, 'The Surgeon'),
('☄️', 0, 'Typing God'),
('🎓', 0, 'Keyboard Master'),
('🌟', 0, 'Divine Accuracy');

-- Rock Paper Scissors Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('💴', 0, 'Centurion Gambler'), 
('🔮', 0, 'The Oracle'),
('🎖️', 0, 'Tactician'),         
('✨', 0, 'Flawless Execution'); 

-- Tic Tac Toe Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('👴', 0, 'Grid Veteran'),
('🤴', 0, 'Flawless Victory'),
('🏰', 0, 'The Unbeatable'),
('⚔️', 0, 'Divine Ruler');       

-- Wordle Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🪙', 0, 'Wordle Veteran'),    
('🥈', 0, 'Dynamic Duo'),
('🃏', 0, 'First Time Lucky'),  
('🧠', 0, 'Deja Vu'),
('⭐', 0, 'Lexical Legend'),     
('💍', 0, 'The Final Word');    

-- Quick Maths Gold
INSERT INTO avatars (icon, is_free, achievement_name) VALUES 
('🧮', 0, 'Calculator Brain'),  
('🏹', 0, 'Mathematical Sniper'),
('💠', 0, 'The Human Abacus'),  
('🎩', 0, 'Alge-Bro'),         
('🪐', 0, 'Infinite Logic'),    
('💰', 0, 'Millionaire Mindset');
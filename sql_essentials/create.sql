USE arcadedb;

DROP TABLE IF EXISTS reaction_time_scores;
DROP TABLE IF EXISTS sequence_scores;
DROP TABLE IF EXISTS number_scores;
DROP TABLE IF EXISTS verbal_scores;
DROP TABLE IF EXISTS visual_scores;
DROP TABLE IF EXISTS typing_speed_scores;
DROP TABLE IF EXISTS rockpaperscissors_scores;
DROP TABLE IF EXISTS tictactoe_scores;
DROP TABLE IF EXISTS wordle_scores;
DROP TABLE IF EXISTS quick_math_scores;

DROP TABLE IF EXISTS user_avatars;
DROP TABLE IF EXISTS avatars;

DROP TABLE IF EXISTS user_xp;
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;

DROP TABLE IF EXISTS user_scores;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;

CREATE TABLE users(
	id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '👤',
    xp INT DEFAULT 0,
    streak INT DEFAULT 0,
    is_public TINYINT(1) DEFAULT 1,
    last_joined TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE games(
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'Benchmark',
    emoji VARCHAR(10) NOT NULL,
    path VARCHAR(100) NOT NULL
);

CREATE TABLE user_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    games_id INT NOT NULL,
    score_id INT NOT NULL,
    xp_earned INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
		ON DELETE CASCADE,
    FOREIGN KEY (games_id) REFERENCES games(id)
);

-- Reaction Time Scores
CREATE TABLE reaction_time_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    try1 INT NOT NULL DEFAULT 0,
    try2 INT NOT NULL DEFAULT 0,
    try3 INT NOT NULL DEFAULT 0,
    best INT NOT NULL DEFAULT 0,
    average INT NOT NULL DEFAULT 0
);

-- Sequence Memory Scores
CREATE TABLE sequence_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    level_reached INT NOT NULL DEFAULT 0,
    sequence TEXT NOT NULL
);

-- Number Memory Scores
CREATE TABLE number_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    level_reached INT NOT NULL DEFAULT 0,
    number_fail INT NOT NULL DEFAULT 0
);

-- Verbal Memory Scores
CREATE TABLE verbal_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL DEFAULT 0 
);

-- Visual Memory Scores
CREATE TABLE visual_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    level_reached INT NOT NULL DEFAULT 0,
    max_grid_size INT NOT NULL DEFAULT 3
);

-- Typing Speed Scores
CREATE TABLE typing_speed_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    words_typed INT NOT NULL DEFAULT 0,
    wpm INT NOT NULL DEFAULT 0,
    accuracy INT NOT NULL DEFAULT 0
);

-- Rock-Paper-Scissors Scores
CREATE TABLE rockpaperscissors_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
    losses INT NULL NULL DEFAULT 0,
    result VARCHAR(10) NOT NULL
);

-- Tic-Tac-Toe Scores
CREATE TABLE tictactoe_scores(
	id INT AUTO_INCREMENT PRIMARY KEY,
    played INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    draws INT NOT NULL DEFAULT 0,
	losses INT NOT NULL DEFAULT 0,
    result VARCHAR(10) NOT NULL
);

-- Wordle Scores
CREATE TABLE wordle_scores (
	id INT AUTO_INCREMENT PRIMARY KEY,
    attempts INT NOT NULL DEFAULT 0,
    found VARCHAR(10) NOT NULL,
    word_target VARCHAR(10) NOT NULL
);

-- Quick Maths Scores
CREATE TABLE quick_math_scores (
	id INT AUTO_INCREMENT PRIMARY KEY,
    score INT NOT NULL DEFAULT 0,
    total INT NOT NULL DEFAULT 0,
    avg_response_time FLOAT NOT NULL,
    accuracy INT NOT NULL DEFAULT 0
);

-- Achievements 
CREATE TABLE achievements (
	id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) UNIQUE NOT NULL,
    description VARCHAR(255) NOT NULL,
    category VARCHAR(50) DEFAULT 'General',
    emoji VARCHAR(10) DEFAULT '🏆',
    tier ENUM('None', 'Bronze', 'Silver', 'Gold') DEFAULT 'None',
    xp_reward INT DEFAULT 50,
	requirement_type VARCHAR(50) NOT NULL,
    requirement_value INT NOT NULL,
    games_id INT,
    connected_to VARCHAR(200) DEFAULT NULL,
	FOREIGN KEY (games_id) REFERENCES games(id)
);

-- User Achievements - UNLOCKED
CREATE TABLE user_achievements (
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
		ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
		ON DELETE CASCADE,
    UNIQUE KEY (user_id, achievement_id)
);

-- Usar XP Rewards
CREATE TABLE user_xp (
	id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount INT NOT NULL,
    source ENUM('game', 'achievement', 'streak', 'bonus') NOT NULL,
    reference_id INT,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) 
		ON DELETE CASCADE
);

CREATE TABLE avatars (
	id INT AUTO_INCREMENT PRIMARY KEY,
    icon VARCHAR(10) NOT NULL,
    is_free TINYINT(1) DEFAULT 0,
    achievement_name VARCHAR(255),
    FOREIGN KEY (achievement_name) REFERENCES achievements(name)
		ON DELETE CASCADE 
);

CREATE TABLE user_avatars (
	user_id INT,
    avatar_id INT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, avatar_id),
    FOREIGN KEY (user_id) REFERENCES users(id) 
		ON DELETE CASCADE,
	FOREIGN KEY (avatar_id) REFERENCES avatars(id) 
		ON DELETE CASCADE
);
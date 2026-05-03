"# FullStack Arcade WebApp

A full-stack arcade platform featuring 10 interactive games. Built with **React**, **Node.js**, and **MySQL**.

## 🚀 Setup

### 1. Database Setup
Run the scripts in the `/sql_essentials` folder:
* Execute `create.sql` to build the tables.
* Execute `insert.sql` to populate the games and achievements data.

### 2. Backend
* Navigate to `/backend`, run `npm install`, and start with `node index.js`.

### 3. Frontend
* Navigate to `/frontend`, run `npm install`, and start with `npm run dev`.

---

## 🕹️ Core Features

### **Authentication & User Profiles***
* Implements a custon authentication system using JWT to manage user sessions
* Users can track their total XP, games streaks and customize their profile visibility

### Gaming & Logic Engine
* Features 10 unique games including congitive benchmarks (Reaction Time, Memory Tests)
  and classic arcade titles (Wordle, Tic-Tac-Toe)
* At the end of every game, performance metrics are captures and instantly synced with the backend
  to update the MySQL database

### Achievements 
* A dynamic achievement engine monitors player data to unlock tiers (**Bronze, Silver, and Gold*) based on specific
  game requirements.
* Unlocking any Gold-tier achievement rewards the user with an exclusive **Emoji Avatar** for their profile.

### Leaderboards
* The system aggregates data across all users to generate real-time leaderboards for every game, based on
  XP earned over a selected period of time and top scores for every game
* Users can click on any username within the leaderboard to view that player's specific stats, achievements, and performance history, allowing for direct comparison

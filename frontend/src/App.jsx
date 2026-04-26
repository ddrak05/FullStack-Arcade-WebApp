import {BrowserRouter, Route, Routes} from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import PublicRoute from './components/PublicRoute.jsx';
import PrivateRoute from "./components/PrivateRoute.jsx";

import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import Achievements from './pages/Achievements.jsx';
import Leaderboard from "./pages/Leaderboard.jsx";
import Profile from './pages/Profile.jsx';
import Compare from './pages/Compare.jsx';
import Settings from './pages/Settings.jsx'

import ReactionTime from "./games/ReactionTime.jsx";
import SequenceMemory from './games/SequenceMemory.jsx';
import NumberMemory from "./games/NumberMemory.jsx";
import VerbalMemory from './games/VerbalMemory.jsx';
import VisualMemory from './games/VisualMemory.jsx';
import TypingSpeed from "./games/TypingSpeed.jsx";
import QuickMaths from "./games/QuickMaths.jsx";
import RockPaperScissors from "./games/RockPaperScissors.jsx";
import TicTacToe from "./games/TicTacToe.jsx";
import Wordle from "./games/Wordle.jsx"

function App() {
  return (
      <BrowserRouter>
          <Navbar />
          <Routes>
              <Route path="/" element={
                  <PrivateRoute><Home /></PrivateRoute>
              } />
              <Route path='*' element={
                  <PrivateRoute><NotFound /></PrivateRoute>
              } />
              <Route path="/login" element={
                  <PublicRoute><Login /></PublicRoute>
              } />
              <Route path="/register" element={
                  <PublicRoute><Register /></PublicRoute>
              } />
              <Route path="/achievements" element={
                  <PrivateRoute><Achievements /></PrivateRoute>
              } />
              <Route path="/leaderboard" element={
                  <PrivateRoute><Leaderboard /></PrivateRoute>
              } />
              <Route path="/profile/:username" element={
                  <PrivateRoute><Profile /></PrivateRoute>
              } />
              <Route path="/profile/:username/compare" element={
                  <PrivateRoute><Compare /></PrivateRoute>
              } />
              <Route path="/settings" element={
                  <PrivateRoute><Settings /></PrivateRoute>
              } />
              <Route path='/games/reaction-time' element={
                  <PrivateRoute><ReactionTime /></PrivateRoute>
              } />
              <Route path='/games/sequence-memory' element={
                  <PrivateRoute><SequenceMemory /></PrivateRoute>
              } />
              <Route path='/games/number-memory' element={
                  <PrivateRoute><NumberMemory /></PrivateRoute>
              } />
              <Route path='/games/verbal-memory' element={
                  <PrivateRoute><VerbalMemory /></PrivateRoute>
              } />
              <Route path='/games/visual-memory' element={
                  <PrivateRoute><VisualMemory /></PrivateRoute>
              } />
              <Route path='/games/typing-speed' element={
                  <PrivateRoute><TypingSpeed /></PrivateRoute>
              } />
              <Route path='/games/quick-maths' element={
                  <PrivateRoute><QuickMaths /></PrivateRoute>
              } />
              <Route path='/games/rock-paper-scissors' element={
                  <PrivateRoute><RockPaperScissors /></PrivateRoute>
              } />
              <Route path='/games/tic-tac-toe' element={
                  <PrivateRoute><TicTacToe /></PrivateRoute>
              } />
              <Route path='/games/wordle' element={
                  <PrivateRoute><Wordle /></PrivateRoute>
              } />
          </Routes>
      </BrowserRouter>
  )
}

export default App

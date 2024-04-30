import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JoinRoom from './components/JoinRoom';
import VideoChat from './components/VideoChat';
import TicTacToe from './components/TicTacToe';
import Whiteboard from './components/Whiteboard';
import './App.css';
import logo from './logo/logo.png'; // Import the logo (ensure it's in your project)

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} alt="Doodle Connect" className="App-logo" /> {/* Logo */}
          <nav>
            <ul className="nav-list">
              <li>
                <Link to="/">Join Room</Link>
              </li>
              <li>
                <Link to="/video-chat">Video Chat</Link>
              </li>
              <li>
                <Link to="/tic-tac-toe">Tic Tac Toe</Link>
              </li>
              <li>
                <Link to="/whiteboard">Whiteboard</Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="App-main">
          <Routes>
            <Route path="/" element={<JoinRoom />} />
            <Route path="/video-chat" element={<VideoChat />} />
            <Route path="/tic-tac-toe" element={<TicTacToe />} />
            <Route path="/whiteboard" element={<Whiteboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

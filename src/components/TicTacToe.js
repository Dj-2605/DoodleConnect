import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import './TicTacToe.css'; // Importing the CSS

const winningCombinations = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal (top-left to bottom-right)
  [2, 4, 6], // Diagonal (top-right to bottom-left),
];

const TicTacToe = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [player, setPlayer] = useState('X');
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false); // State to track if it's a draw
  const [xWins, setXWins] = useState(0);
  const [oWins, setOWins] = useState(0);
  const [draws, setDraws] = useState(0); // State to track draw counts

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Change to your server address
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsHost(true);
      const roomId = newSocket.id; // The host's unique ID
      setRoomId(roomId);
      newSocket.emit('create-room', roomId); // Create a room
    });

    newSocket.on('join-room', (joinedRoomId) => {
      setIsHost(false);
      setRoomId(joinedRoomId);
    });

    newSocket.on('move', (index, symbol) => {
      handleMove(index, symbol); // Handle move from the server
    });

    return () => {
      newSocket.disconnect(); // Cleanup on unmount
    };
  }, []);

  const checkWinner = (board, symbol) => {
    return winningCombinations.some((combination) => {
      return combination.every((index) => board[index] === symbol);
    });
  };

  const handleMove = (index, symbol) => {
    if (board[index] !== null || winner || draw) return; // Prevent moves on a filled square or if there's a winner/draw

    const newBoard = [...board];
    newBoard[index] = symbol;
    setBoard(newBoard);

    if (checkWinner(newBoard, symbol)) {
      setWinner(symbol); // If there's a winner, set the winner
      if (symbol === 'X') {
        setXWins(xWins + 1); // Increment X wins
      } else {
        setOWins(oWins + 1); // Increment O wins
      }
    } else if (newBoard.every((cell) => cell !== null)) { // Check for a draw
      setDraw(true); // If no winner and all cells are filled, it's a draw
      setDraws(draws + 1); // Increment the draw count
    } else {
      setPlayer(symbol === 'X' ? 'O' : 'X'); // Switch to the other player
    }
  };

  const handleClick = (index) => {
    if (winner || draw) return; // Prevent moves if there's a winner/draw
    handleMove(index, player);
    socket.emit('move', index, player, roomId); // Emit the move
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null)); // Reset the board
    setWinner(null); // Reset the winner
    setDraw(false); // Reset the draw flag
    setPlayer('X'); // Reset the starting player
  };

  const renderSquare = (index) => {
    return (
      <div className="square" onClick={() => handleClick(index)}>
        {board[index]}
      </div>
    );
  };

  return (
    <div>
      <h1 className="game-info">Tic Tac Toe</h1>
      {winner && (
        <div className="winner">
          {`Player ${winner} wins!`} {/* Announce the winner */}
          <button onClick={resetGame}>Reset Game</button> {/* Button to reset the game */}
        </div>
      )}
      {draw && (
        <div className="draw">
          It's a draw! {/* Announce a draw */}
          <button onClick={resetGame}>Reset Game</button> {/* Button to reset the game */}
        </div>
      )}
      <div className="board">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => renderSquare(index))}
      </div>
      <div className="game-stats">
        <p>Player X Wins: {xWins}</p> {/* Display X wins */}
        <p>Player O Wins: {oWins}</p> {/* Display O wins */}
        <p>Total Draws: {draws}</p> {/* Display draw count */}
      </div>
    </div>
  );
};

export default TicTacToe;

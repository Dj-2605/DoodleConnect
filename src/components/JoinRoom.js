import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoom.css'; // CSS for styling

const JoinRoom = () => {
  const [roomId, setRoomId] = useState(''); // Room ID input
  const [playerName, setPlayerName] = useState(''); // Player name input
  const navigate = useNavigate();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8); // Simple random room ID
  };

  const handleCreateRoom = () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId); // Set the room ID
    // Share the room ID (you could display it or copy to clipboard)
  };

  const handleJoinRoom = () => {
    if (roomId.trim() && playerName.trim()) {
      navigate(`/room/${roomId}?name=${encodeURIComponent(playerName)}`); // Navigate to the room with player name
    } else {
      alert('Please enter both Room ID and Player Name');
    }
  };

  return (
    <div className="join-room">
      <h1>Join Room</h1>
      <input
        type="text"
        placeholder="Enter Room ID or click Create Room"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={handleCreateRoom}>Create Room</button> {/* Button to create a new room */}
      <input
        type="text"
        placeholder="Enter Your Name"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
      />
      <button onClick={handleJoinRoom}>Join Room</button> {/* Button to join the room */}
      {roomId && (
        <div className="invite-link"> {/* Display the room ID for sharing */}
          <p>Invite Link: <code>{`http://localhost:3000/room/${roomId}`}</code></p> {/* Change localhost:3000 to your project URL */}
        </div>
      )}
    </div>
  );
};

export default JoinRoom;

import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import './Whiteboard.css'; // CSS for styling

const Whiteboard = ({ roomId, userId }) => {
  const canvasRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [isEraser, setIsEraser] = useState(false);
  const [lineWidth, setLineWidth] = useState(2);

  useEffect(() => {
    const newSocket = io('http://localhost:3001'); // Adjust as needed
    setSocket(newSocket);

    newSocket.emit('join-room', roomId, userId); // Join the room

    newSocket.on('draw', (data) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = data.lineWidth;
      ctx.strokeStyle = data.color;
      ctx.beginPath();
      ctx.moveTo(data.prevX, data.prevY);
      ctx.lineTo(data.currX, data.currY);
      ctx.stroke();
    });

    newSocket.on('clear', () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, userId]); // Dependency array ensures the effect runs when roomId or userId changes

  const handleMouseDown = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color; // Use white for eraser mode
    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();

    socket.emit('draw', {
      prevX: e.nativeEvent.offsetX - e.nativeEvent.movementX,
      prevY: e.nativeEvent.offsetY - e.nativeEvent.movementY,
      currX: e.nativeEvent.offsetX,
      currY: e.nativeEvent.offsetY,
      color: isEraser ? '#FFFFFF' : color, // Send white color for eraser mode
      lineWidth,
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleReset = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    socket.emit('clear'); // Notify other users to clear their canvas
  };

  return (
    <div className="whiteboard">
      <canvas
        ref={canvasRef}
        width="500"
        height="500"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <div className="controls"> {/* Controls for the whiteboard */}
        <div>
          <label>Pen Color: </label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div>
          <label>Pen Size: </label>
          <input type="range" min="1" max="10" value={lineWidth} onChange={(e) => setLineWidth(e.target.value)} />
        </div>
        <div>
          <label>Eraser Mode: </label>
          <input type="checkbox" checked={isEraser} onChange={() => setIsEraser(!isEraser)} />
        </div>
        <button onClick={handleReset}>Reset Canvas</button>
      </div>
    </div>
  );
};

export default Whiteboard;

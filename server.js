const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  },
});

const PORT = process.env.PORT || 3001;

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    console.log(`User ${userId} joined room ${roomId}`);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });

  socket.on('offer', (offer, roomId, senderId) => {
    socket.to(roomId).broadcast.emit('offer', offer, senderId);
  });

  socket.on('answer', (answer, roomId, senderId) => {
    socket.to(roomId).broadcast.emit('answer', answer, senderId);
  });

  socket.on('ice-candidate', (candidate, roomId, senderId) => {
    socket.to(roomId).broadcast.emit('ice-candidate', candidate, senderId);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

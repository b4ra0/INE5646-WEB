const waitingQueue = [];

export function setupSockets(io) {
  io.on('connection', (socket) => {
    console.log('User connected', socket.id);

    socket.on('join-queue', (user) => {
      waitingQueue.push({ socketId: socket.id, user });
      // lógica de emparelhar dois jogadores
      if (waitingQueue.length >= 2) {
        const p1 = waitingQueue.shift();
        const p2 = waitingQueue.shift();
        const roomId = `room-${p1.socketId}-${p2.socketId}`;

        io.to(p1.socketId).emit('match-found', { roomId, opponent: p2.user });
        io.to(p2.socketId).emit('match-found', { roomId, opponent: p1.user });

        socket.join(roomId);
        io.sockets.sockets.get(p1.socketId)?.join(roomId);
        io.sockets.sockets.get(p2.socketId)?.join(roomId);
      }
    });

    // chat simples
    socket.on('chat-message', (payload) => {
      const { roomId, message } = payload;
      io.to(roomId || 'global').emit('chat-message', message);
    });

    // sinalização WebRTC (vídeo chat)
    socket.on('webrtc-signal', ({ roomId, data }) => {
      socket.to(roomId).emit('webrtc-signal', data);
    });

    socket.on('disconnect', () => {
      // remover da fila
    });
  });
}

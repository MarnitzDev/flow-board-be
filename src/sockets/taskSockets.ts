import { Server, Socket } from 'socket.io';

export const setupTaskSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected for task updates:', socket.id);

    // Join a room for task updates
    socket.on('joinTaskRoom', (roomId: string) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined task room: ${roomId}`);
    });

    // Leave a room
    socket.on('leaveTaskRoom', (roomId: string) => {
      socket.leave(roomId);
      console.log(`User ${socket.id} left task room: ${roomId}`);
    });

    // Handle task updates
    socket.on('taskUpdated', (data) => {
      socket.to(data.roomId).emit('taskUpdate', data);
    });

    // Handle task creation
    socket.on('taskCreated', (data) => {
      socket.to(data.roomId).emit('newTask', data);
    });

    // Handle task deletion
    socket.on('taskDeleted', (data) => {
      socket.to(data.roomId).emit('taskRemoved', data);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from task updates:', socket.id);
    });
  });
};
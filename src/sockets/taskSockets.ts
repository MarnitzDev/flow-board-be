import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import Task from '../models/Task';
import Board from '../models/Board';
import Project from '../models/Project';
import mongoose from 'mongoose';
import { 
  ServerToClientEvents, 
  ClientToServerEvents, 
  InterServerEvents, 
  SocketData,
  TaskData,
  MoveTaskData
} from '../types/socket';

interface AuthenticatedSocket extends Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
  userId?: string;
  username?: string;
  currentBoard?: string;
}

export const setupTaskSockets = (io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) => {
  // JWT Authentication Middleware for Socket.IO
  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth['token'];
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env['JWT_SECRET'] || 'fallback-secret') as any;
      socket.userId = decoded.userId;
      socket.username = decoded.username || 'Unknown User';
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log('User connected:', socket.userId, socket.username);

    // Early return if no userId (should not happen due to middleware, but safety check)
    if (!socket.userId || !socket.username) {
      socket.emit('error', { message: 'Authentication failed' });
      socket.disconnect();
      return;
    }

    const userId = socket.userId;
    const username = socket.username;

    // ============ BOARD ROOM MANAGEMENT ============
    socket.on('join:board', async (boardId: string) => {
      try {
        // Verify user has access to this board
        const board = await Board.findById(boardId).populate('projectId', 'createdBy members');
        
        if (!board) {
          socket.emit('error', { message: 'Board not found' });
          return;
        }

        const project = board.projectId as any;
        const userObjectId = new mongoose.Types.ObjectId(socket.userId);
        
        // Check if user has access to the board's project
        if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this board' });
          return;
        }

        socket.join(boardId);
        socket.currentBoard = boardId;
        
        // Notify other users in the board
        socket.to(boardId).emit('user:joined', {
          userId: userId,
          username: username,
          boardId: boardId,
          timestamp: new Date()
        });
        
        console.log(`User ${username} joined board ${boardId}`);
      } catch (error) {
        console.error('Error joining board:', error);
        socket.emit('error', { message: 'Failed to join board' });
      }
    });

    socket.on('leave:board', (boardId: string) => {
      socket.leave(boardId);
      
      // Notify other users
      socket.to(boardId).emit('user:left', {
        userId: userId,
        username: username,
        boardId: boardId,
        timestamp: new Date()
      });
      
      if (socket.currentBoard === boardId) {
        delete socket.currentBoard;
      }
      
      console.log(`User ${username} left board ${boardId}`);
    });

    // ============ TASK OPERATIONS ============
    socket.on('task:create', async (taskData: TaskData) => {
      try {
        // Verify user has access to the project
        const project = await Project.findById(taskData.projectId);
        
        if (!project) {
          socket.emit('error', { message: 'Project not found' });
          return;
        }

        const userObjectId = new mongoose.Types.ObjectId(socket.userId);
        
        if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this project' });
          return;
        }

        // Verify board exists and belongs to the project
        const board = await Board.findOne({ _id: taskData.boardId, projectId: taskData.projectId });
        
        if (!board) {
          socket.emit('error', { message: 'Board not found or does not belong to this project' });
          return;
        }

        // Create the task
        const task = new Task({
          ...taskData,
          reporter: userId,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate) : undefined
        });

        await task.save();

        // If columnId is provided, add task to that column
        if (taskData.columnId && board.columns) {
          const column = board.columns.find(col => col._id?.toString() === taskData.columnId);
          if (column) {
            column.taskIds.push(task._id as any);
            await board.save();
          }
        }

        const populatedTask = await Task.findById(task._id)
          .populate('assignee', 'username email avatar')
          .populate('reporter', 'username email avatar')
          .populate('projectId', 'name color')
          .populate('boardId', 'name');
        
        // Broadcast to all users in the board
        io.to(taskData.boardId).emit('taskCreated', {
          task: populatedTask,
          createdBy: {
            userId: userId,
            username: username
          },
          timestamp: new Date()
        });
        
        console.log('Task created via socket:', task._id);
      } catch (error) {
        console.error('Error creating task:', error);
        socket.emit('error', { message: 'Failed to create task', error: (error as Error).message });
      }
    });

    socket.on('task:update', async (taskId: string, updates: Partial<TaskData>) => {
      try {
        const task = await Task.findById(taskId).populate('projectId', 'createdBy members');

        if (!task) {
          socket.emit('error', { message: 'Task not found' });
          return;
        }

        // Check if user has access to the task's project
        const project = task.projectId as any;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this task' });
          return;
        }

        // Update the task
        const updatedTask = await Task.findByIdAndUpdate(
          taskId,
          { 
            ...updates,
            ...(updates.dueDate && { dueDate: new Date(updates.dueDate) })
          },
          { new: true, runValidators: true }
        )
        .populate('assignee', 'username email avatar')
        .populate('reporter', 'username email avatar')
        .populate('projectId', 'name color')
        .populate('boardId', 'name');
        
        // Broadcast to all users in the board
        io.to(task.boardId.toString()).emit('taskUpdated', {
          task: updatedTask,
          updatedBy: {
            userId: userId,
            username: username
          },
          changes: updates,
          timestamp: new Date()
        });
        
        console.log('Task updated via socket:', taskId);
      } catch (error) {
        console.error('Error updating task:', error);
        socket.emit('error', { message: 'Failed to update task', error: (error as Error).message });
      }
    });

    socket.on('task:delete', async (taskId: string) => {
      try {
        const task = await Task.findById(taskId).populate('projectId', 'createdBy members');

        if (!task) {
          socket.emit('error', { message: 'Task not found' });
          return;
        }

        // Check if user has access to the task's project
        const project = task.projectId as any;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this task' });
          return;
        }

        const boardId = task.boardId.toString();

        // Remove task from board column
        if (task.columnId && task.boardId) {
          const board = await Board.findById(task.boardId);
          if (board && board.columns) {
            const column = board.columns.find(col => col._id?.toString() === task.columnId?.toString());
            if (column) {
              column.taskIds = column.taskIds.filter(id => id.toString() !== taskId);
              await board.save();
            }
          }
        }

        await Task.findByIdAndDelete(taskId);
        
        // Broadcast to all users in the board
        io.to(boardId).emit('taskDeleted', {
          taskId,
          deletedBy: {
            userId: userId,
            username: username
          },
          timestamp: new Date()
        });
        
        console.log('Task deleted via socket:', taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        socket.emit('error', { message: 'Failed to delete task', error: (error as Error).message });
      }
    });

    // ============ ADDITIONAL REAL-TIME EVENTS ============
    
    // Test event for debugging drag and drop
    socket.on('test:drag', (data: any) => {
      console.log('Received test:drag event:', data);
      if (data.boardId) {
        socket.to(data.boardId).emit('test:drag', {
          ...data,
          echoed: true,
          timestamp: new Date()
        });
      }
    });

    // Direct task update broadcast (for immediate UI updates)
    socket.on('task:updated', (data: any) => {
      console.log('Received task:updated event:', data);
      if (data.boardId) {
        socket.to(data.boardId).emit('task:updated', {
          ...data,
          timestamp: new Date()
        });
      }
    });

    // Enhanced task move event (simplified for frontend)
    socket.on('task:move', async (moveData: MoveTaskData) => {
      try {
        const { taskId, fromColumnId, toColumnId, position, boardId } = moveData;
        
        // First broadcast the optimistic update to other clients immediately
        socket.to(boardId).emit('task:moved', {
          taskId,
          fromColumnId,
          toColumnId,
          position,
          boardId,
          movedBy: {
            userId: userId,
            username: username
          },
          timestamp: new Date()
        });

        // Then update the database
        const task = await Task.findById(taskId).populate('projectId', 'createdBy members');

        if (!task) {
          socket.emit('error', { message: 'Task not found' });
          return;
        }

        // Check if user has access to the task's project
        const project = task.projectId as any;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this task' });
          return;
        }

        // Update task's columnId
        task.columnId = new mongoose.Types.ObjectId(toColumnId);
        await task.save();

        // Update board columns
        const board = await Board.findById(boardId);
        
        if (board && board.columns) {
          // Remove from source column
          const fromColumn = board.columns.find(col => col._id?.toString() === fromColumnId);
          if (fromColumn) {
            fromColumn.taskIds = fromColumn.taskIds.filter(id => id.toString() !== taskId);
          }

          // Add to destination column at specified position
          const toColumn = board.columns.find(col => col._id?.toString() === toColumnId);
          if (toColumn) {
            if (typeof position === 'number' && position >= 0) {
              toColumn.taskIds.splice(position, 0, task._id as any);
            } else {
              toColumn.taskIds.push(task._id as any);
            }
          }

          await board.save();
        }

        const populatedTask = await Task.findById(task._id)
          .populate('assignee', 'username email avatar')
          .populate('reporter', 'username email avatar')
          .populate('projectId', 'name color')
          .populate('boardId', 'name');
        
        // Send confirmation with full task data
        socket.to(boardId).emit('taskMoved', {
          task: populatedTask,
          fromColumnId,
          toColumnId,
          position,
          boardId,
          movedBy: {
            userId: userId,
            username: username
          },
          timestamp: new Date()
        });
        
        console.log('Task moved via socket:', taskId, 'from', fromColumnId, 'to', toColumnId);
      } catch (error) {
        console.error('Error moving task:', error);
        socket.emit('error', { message: 'Failed to move task', error: (error as Error).message });
        
        // Emit revert signal to all clients
        socket.to(moveData.boardId).emit('task:move_failed', {
          taskId: moveData.taskId,
          error: 'Failed to move task',
          timestamp: new Date()
        });
      }
    });

    // ============ TYPING INDICATORS ============
    socket.on('user:start_typing', ({ taskId }: { taskId: string }) => {
      if (socket.currentBoard) {
        socket.to(socket.currentBoard).emit('user:typing', {
          userId: userId,
          username: username,
          taskId: taskId,
          timestamp: new Date()
        });
      }
    });

    socket.on('user:stop_typing', ({ taskId }: { taskId: string }) => {
      if (socket.currentBoard) {
        socket.to(socket.currentBoard).emit('user:stop_typing', {
          userId: userId,
          username: username,
          taskId: taskId,
          timestamp: new Date()
        });
      }
    });

    // ============ BOARD COLUMN UPDATES ============
    socket.on('board:update_columns', async (boardId: string, columns: any[]) => {
      try {
        const board = await Board.findById(boardId).populate('projectId', 'createdBy members');
        
        if (!board) {
          socket.emit('error', { message: 'Board not found' });
          return;
        }

        // Check if user has access to the board's project
        const project = board.projectId as any;
        const userObjectId = new mongoose.Types.ObjectId(userId);
        
        if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
          socket.emit('error', { message: 'Access denied to this board' });
          return;
        }

        await Board.findByIdAndUpdate(boardId, { columns }, { new: true, runValidators: true });
        
        // Broadcast to all users in the board
        socket.to(boardId).emit('board:columns_updated', {
          boardId,
          columns,
          updatedBy: {
            userId: userId,
            username: username
          },
          timestamp: new Date()
        });
        
        console.log('Board columns updated via socket:', boardId);
      } catch (error) {
        console.error('Error updating board columns:', error);
        socket.emit('error', { message: 'Failed to update board columns', error: (error as Error).message });
      }
    });

    // ============ PRESENCE TRACKING ============
    socket.on('user:cursor_move', (data: { x: number; y: number; boardId: string }) => {
      socket.to(data.boardId).emit('user:cursor_moved', {
        userId: userId,
        username: username,
        x: data.x,
        y: data.y,
        timestamp: new Date()
      });
    });

    // ============ HANDLE DISCONNECTION ============
    socket.on('disconnect', (reason) => {
      console.log('User disconnected:', username, reason);
      
      if (socket.currentBoard) {
        socket.to(socket.currentBoard).emit('user:left', {
          userId: userId,
          username: username,
          boardId: socket.currentBoard,
          timestamp: new Date()
        });
      }
    });

    // ============ ERROR HANDLING ============
    socket.on('error', (error) => {
      console.error('Socket error for user', username, ':', error);
    });
  });

  console.log('✅ Socket.IO server configured with authentication and real-time collaboration features');
};
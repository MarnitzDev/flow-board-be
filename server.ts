import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env['CLIENT_URL'] || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
import taskRoutes from './src/routes/tasks';
import authRoutes from './src/routes/auth';
import { setupTaskSockets } from './src/sockets/taskSockets';

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Flowboard Backend API is running!' });
});

// API routes
app.use('/api/tasks', taskRoutes);
app.use('/api/auth', authRoutes);

// Socket.IO connection handling
setupTaskSockets(io);

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env['MONGODB_URI'] || 'mongodb://localhost:27017/flowboard');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Connect to database
connectDB();

const PORT = process.env['PORT'] || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
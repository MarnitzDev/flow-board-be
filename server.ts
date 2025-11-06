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
    origin: [
      process.env['CLIENT_URL'] || "http://localhost:3000",
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static('public'));

// Import routes
import taskRoutes from './src/routes/tasks';
import authRoutes from './src/routes/auth';
import projectRoutes from './src/routes/projects';
import boardRoutes from './src/routes/boards';
import collectionRoutes from './src/routes/collections';
import { setupTaskSockets } from './src/sockets/taskSockets';
import { setSocketIO } from './src/controllers/taskController';
import { setSocketIO as setCollectionSocketIO } from './src/controllers/collectionController';

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Flowboard Backend API is running!' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.IO connection handling
setupTaskSockets(io);

// Inject Socket.IO instance into controllers for REST API events
setSocketIO(io);
setCollectionSocketIO(io);

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
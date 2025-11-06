import express from 'express';
import { getTasks, getTaskById, createTask, updateTask, moveTask, deleteTask, getTasksByBoard, createSubtask, getSubtasks, getProjectLabels } from '../controllers/taskController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authenticate);

// GET /api/tasks - Get all tasks (with optional filters)
router.get('/', getTasks);

// GET /api/tasks/board/:boardId - Get all tasks for a specific board
router.get('/board/:boardId', getTasksByBoard);

// GET /api/tasks/labels/:projectId - Get all unique labels for a project
router.get('/labels/:projectId', getProjectLabels);

// GET /api/tasks/:id - Get a specific task
router.get('/:id', getTaskById);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// POST /api/tasks/:id/subtasks - Create a subtask
router.post('/:id/subtasks', createSubtask);

// GET /api/tasks/:id/subtasks - Get all subtasks for a task
router.get('/:id/subtasks', getSubtasks);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// PUT /api/tasks/:id/move - Move task between columns (drag & drop)
router.put('/:id/move', moveTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;
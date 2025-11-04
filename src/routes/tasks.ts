import express from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/taskController';

const router = express.Router();

// GET /api/tasks - Get all tasks
router.get('/', getTasks);

// POST /api/tasks - Create a new task
router.post('/', createTask);

// PUT /api/tasks/:id - Update a task
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Delete a task
router.delete('/:id', deleteTask);

export default router;
import express from 'express';
import { getProjects, createProject, updateProject, deleteProject, addMembers } from '../controllers/projectController';
import { getBoardsByProject } from '../controllers/boardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All project routes require authentication
router.use(authenticate);

// GET /api/projects - Get user's projects
router.get('/', getProjects);

// POST /api/projects - Create new project
router.post('/', createProject);

// PUT /api/projects/:id - Update project
router.put('/:id', updateProject);

// DELETE /api/projects/:id - Delete project
router.delete('/:id', deleteProject);

// POST /api/projects/:id/members - Add members to project
router.post('/:id/members', addMembers);

// GET /api/projects/:id/boards - Get boards for a specific project (alternative endpoint)
router.get('/:projectId/boards', getBoardsByProject);

export default router;
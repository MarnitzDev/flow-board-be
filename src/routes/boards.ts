import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getBoards,
  getBoardsByProject,
  getBoardById,
  createBoard,
  updateBoard,
  updateBoardColumns,
  deleteBoard
} from '../controllers/boardController';

const router = express.Router();

// Apply authentication middleware to all board routes
router.use(authenticate);

// Board routes
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.post('/', createBoard);
router.put('/:id', updateBoard);
router.put('/:id/columns', updateBoardColumns);
router.delete('/:id', deleteBoard);

export default router;
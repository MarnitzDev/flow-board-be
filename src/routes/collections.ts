import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCollections,
  getCollectionsByProject,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  reorderCollections
} from '../controllers/collectionController';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Collection routes
router.get('/', getCollections);
router.get('/project/:projectId', getCollectionsByProject);
router.get('/:id', getCollectionById);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

// Special routes
router.put('/reorder', reorderCollections);

export default router;
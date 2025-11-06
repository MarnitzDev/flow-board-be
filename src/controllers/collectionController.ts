import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';
import Collection from '../models/Collection';
import Project from '../models/Project';
import Task from '../models/Task';
import { Server } from 'socket.io';

// Socket.IO instance (will be injected)
let io: Server;

export const setSocketIO = (socketInstance: Server) => {
  io = socketInstance;
};

// GET /api/collections - Get collections for authenticated user
export const getCollections = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Build query
    let query: any = {};

    if (projectId) {
      // Verify user has access to this project
      const project = await Project.findById(projectId);
      
      if (!project) {
        return res.status(404).json({
          success: false,
          error: 'Project not found'
        });
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this project'
        });
      }

      query.projectId = projectId;
    } else {
      // Get all collections for projects user has access to
      const userProjects = await Project.find({
        $or: [
          { createdBy: userId },
          { members: userId }
        ]
      }).select('_id');

      const projectIds = userProjects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }

    // Only show non-archived collections by default
    if (req.query['includeArchived'] !== 'true') {
      query.isArchived = false;
    }

    const collections = await Collection.find(query)
      .populate('projectId', 'name color')
      .populate('createdBy', 'username email')
      .sort({ order: 1, createdAt: 1 });

    return res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get collections error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching collections' 
    });
  }
};

// GET /api/collections/project/:projectId - Get collections for a specific project
export const getCollectionsByProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;
    const { includeArchived = 'false' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify user has access to this project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project'
      });
    }

    // Build query for project collections
    let query: any = { projectId };

    // Only show non-archived collections by default
    if (includeArchived !== 'true') {
      query.isArchived = false;
    }

    const collections = await Collection.find(query)
      .populate('createdBy', 'username email')
      .sort({ order: 1, createdAt: 1 });

    return res.json({
      success: true,
      data: collections
    });
  } catch (error) {
    console.error('Get collections by project error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching project collections' 
    });
  }
};

// GET /api/collections/:id - Get a specific collection with tasks
export const getCollectionById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { includeTasks = 'true' } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const collection = await Collection.findById(id)
      .populate('projectId', 'name color createdBy members')
      .populate('createdBy', 'username email');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Check if user has access to the collection's project
    const project = collection.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this collection'
      });
    }

    let result: any = collection.toObject();

    // Include tasks if requested
    if (includeTasks === 'true') {
      const tasks = await Task.find({ 
        collectionId: id,
        isSubtask: false // Only main tasks, not subtasks
      })
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .sort({ order: 1, createdAt: 1 });

      result.tasks = tasks;
      result.taskCount = tasks.length;
    }

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get collection by ID error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching collection' 
    });
  }
};

// POST /api/collections - Create new collection
export const createCollection = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const user = req.user;
    const { 
      name, 
      description, 
      color = '#6366F1',
      projectId,
      order = 0
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!name || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Name and project ID are required'
      });
    }

    // Verify user has access to the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project'
      });
    }

    // Create the collection
    const collection = new Collection({
      name,
      description,
      color,
      projectId,
      order,
      createdBy: userId
    });

    await collection.save();

    const populatedCollection = await Collection.findById(collection._id)
      .populate('projectId', 'name color')
      .populate('createdBy', 'username email');

    // 🚀 EMIT SOCKET.IO EVENT FOR REAL-TIME UPDATES
    if (io && populatedCollection) {
      console.log('Emitting collection:created event for collection:', collection._id);
      
      io.to(projectId).emit('collection:created', {
        collection: populatedCollection,
        createdBy: {
          userId: userId,
          username: user?.username || 'Unknown User'
        },
        timestamp: new Date()
      });
      console.log('Emitted collection:created event to project:', projectId);
    }

    return res.status(201).json({
      success: true,
      data: populatedCollection
    });
  } catch (error) {
    console.error('Create collection error:', error);
    
    // Handle duplicate name error
    if ((error as any).code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'A collection with this name already exists in this project'
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while creating collection' 
    });
  }
};

// PUT /api/collections/:id - Update collection
export const updateCollection = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const user = req.user;
    const { id } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const collection = await Collection.findById(id)
      .populate('projectId', 'createdBy members');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Check if user has access to the collection's project
    const project = collection.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this collection'
      });
    }

    // Update the collection
    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('projectId', 'name color')
    .populate('createdBy', 'username email');

    // 🚀 EMIT SOCKET.IO EVENT FOR REAL-TIME UPDATES
    if (io && updatedCollection) {
      console.log('Emitting collection:updated event for collection:', id);
      
      io.to(updatedCollection.projectId._id.toString()).emit('collection:updated', {
        collection: updatedCollection,
        updatedBy: {
          userId: userId,
          username: user?.username || 'Unknown User'
        },
        changes: updateData,
        timestamp: new Date()
      });
      console.log('Emitted collection:updated event to project:', updatedCollection.projectId._id);
    }

    return res.json({
      success: true,
      data: updatedCollection
    });
  } catch (error) {
    console.error('Update collection error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while updating collection' 
    });
  }
};

// DELETE /api/collections/:id - Delete collection
export const deleteCollection = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const user = req.user;
    const { id } = req.params;
    const { moveTasksToCollection } = req.query; // Optional: move tasks to another collection

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const collection = await Collection.findById(id)
      .populate('projectId', 'createdBy members');

    if (!collection) {
      return res.status(404).json({
        success: false,
        error: 'Collection not found'
      });
    }

    // Check if user has access to the collection's project
    const project = collection.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this collection'
      });
    }

    const projectId = collection.projectId._id.toString();
    const collectionName = collection.name;

    // Handle tasks in this collection
    if (moveTasksToCollection) {
      // Move tasks to another collection
      await Task.updateMany(
        { collectionId: id },
        { collectionId: moveTasksToCollection }
      );
    } else {
      // Remove collection reference from tasks (tasks remain but ungrouped)
      await Task.updateMany(
        { collectionId: id },
        { $unset: { collectionId: 1 } }
      );
    }

    await Collection.findByIdAndDelete(id);

    // 🚀 EMIT SOCKET.IO EVENT FOR REAL-TIME UPDATES
    if (io) {
      console.log('Emitting collection:deleted event for collection:', id);
      
      io.to(projectId).emit('collection:deleted', {
        collectionId: id,
        collection: { name: collectionName },
        deletedBy: {
          userId: userId,
          username: user?.username || 'Unknown User'
        },
        movedToCollection: moveTasksToCollection || null,
        timestamp: new Date()
      });
      console.log('Emitted collection:deleted event to project:', projectId);
    }

    return res.json({
      success: true,
      message: 'Collection deleted successfully'
    });
  } catch (error) {
    console.error('Delete collection error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while deleting collection' 
    });
  }
};

// PUT /api/collections/reorder - Reorder collections within a project
export const reorderCollections = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const user = req.user;
    const { projectId, collectionIds } = req.body; // Array of collection IDs in new order

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!projectId || !collectionIds || !Array.isArray(collectionIds)) {
      return res.status(400).json({
        success: false,
        error: 'Project ID and collection IDs array are required'
      });
    }

    // Verify user has access to the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project'
      });
    }

    // Update order for each collection
    const updatePromises = collectionIds.map((collectionId: string, index: number) => 
      Collection.findByIdAndUpdate(collectionId, { order: index })
    );

    await Promise.all(updatePromises);

    // Get updated collections
    const updatedCollections = await Collection.find({ projectId })
      .populate('projectId', 'name color')
      .populate('createdBy', 'username email')
      .sort({ order: 1 });

    // 🚀 EMIT SOCKET.IO EVENT FOR REAL-TIME UPDATES
    if (io) {
      console.log('Emitting collections:reordered event for project:', projectId);
      
      io.to(projectId).emit('collections:reordered', {
        projectId,
        collections: updatedCollections,
        reorderedBy: {
          userId: userId,
          username: user?.username || 'Unknown User'
        },
        timestamp: new Date()
      });
      console.log('Emitted collections:reordered event to project:', projectId);
    }

    return res.json({
      success: true,
      data: updatedCollections
    });
  } catch (error) {
    console.error('Reorder collections error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while reordering collections' 
    });
  }
};
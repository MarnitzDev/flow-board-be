import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';
import Board from '../models/Board';
import Project from '../models/Project';

// GET /api/boards - Get boards for authenticated user (optionally filtered by project)
export const getBoards = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // First, get projects the user has access to
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    }).select('_id');

    const projectIds = userProjects.map(p => p._id);

    // Build query for boards
    let query: any = {
      projectId: { $in: projectIds }
    };

    // If projectId is specified, filter by that specific project
    if (projectId) {
      // Verify user has access to this specific project
      const hasAccess = projectIds.some((id: any) => id.toString() === projectId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied to this project'
        });
      }
      query.projectId = projectId;
    }

    const boards = await Board.find(query)
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    console.error('Get boards error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching boards' 
    });
  }
};

// GET /api/projects/:projectId/boards - Get boards for a specific project (alternative endpoint)
export const getBoardsByProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { projectId } = req.params;

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
    
    // Check if user is creator or member
    if (!project.createdBy.equals(userObjectId) && !project.members.some(member => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this project'
      });
    }

    const boards = await Board.find({ projectId })
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    console.error('Get boards by project error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching project boards' 
    });
  }
};

// GET /api/boards/:id - Get a specific board
export const getBoardById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const board = await Board.findById(id)
      .populate('projectId', 'name color createdBy members');

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    // Check if user has access to the board's project
    const project = board.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this board'
      });
    }

    return res.json({
      success: true,
      data: board
    });
  } catch (error) {
    console.error('Get board by ID error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching board' 
    });
  }
};

// POST /api/boards - Create new board
export const createBoard = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { name, projectId, columns } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!name || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'Board name and project ID are required'
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

    // Create board with default columns if none provided
    const defaultColumns = [
      { name: 'To Do', color: '#EF4444', order: 0, taskIds: [] },
      { name: 'In Progress', color: '#F59E0B', order: 1, taskIds: [] },
      { name: 'Done', color: '#10B981', order: 2, taskIds: [] }
    ];

    const board = new Board({
      name,
      projectId,
      columns: columns || defaultColumns
    });

    await board.save();

    const populatedBoard = await Board.findById(board._id)
      .populate('projectId', 'name color');

    return res.status(201).json({
      success: true,
      data: populatedBoard
    });
  } catch (error) {
    console.error('Create board error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while creating board' 
    });
  }
};

// PUT /api/boards/:id - Update board
export const updateBoard = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, columns } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const board = await Board.findById(id)
      .populate('projectId', 'createdBy members');

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    // Check if user has access to the board's project
    const project = board.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this board'
      });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { 
        ...(name && { name }),
        ...(columns && { columns })
      },
      { new: true, runValidators: true }
    ).populate('projectId', 'name color');

    return res.json({
      success: true,
      data: updatedBoard
    });
  } catch (error) {
    console.error('Update board error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while updating board' 
    });
  }
};

// PUT /api/boards/:id/columns - Update board columns (for drag and drop)
export const updateBoardColumns = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { columns } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({
        success: false,
        error: 'Columns array is required'
      });
    }

    const board = await Board.findById(id)
      .populate('projectId', 'createdBy members');

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    // Check if user has access to the board's project
    const project = board.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this board'
      });
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      id,
      { columns },
      { new: true, runValidators: true }
    ).populate('projectId', 'name color');

    return res.json({
      success: true,
      data: updatedBoard
    });
  } catch (error) {
    console.error('Update board columns error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while updating board columns' 
    });
  }
};

// DELETE /api/boards/:id - Delete board
export const deleteBoard = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const board = await Board.findById(id)
      .populate('projectId', 'createdBy members');

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    // Check if user has access to the board's project (only project creator can delete boards)
    const project = board.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId)) {
      return res.status(403).json({
        success: false,
        error: 'Only project creator can delete boards'
      });
    }

    await Board.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    console.error('Delete board error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while deleting board' 
    });
  }
};
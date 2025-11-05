import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';
import Project from '../models/Project';
import Board from '../models/Board';

// GET /api/projects - Get user's projects
export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { members: userId }
      ]
    })
    .populate('createdBy', 'username email')
    .populate('members', 'username email avatar')
    .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching projects' 
    });
  }
};

// POST /api/projects - Create new project
export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { name, description, color } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Project name is required'
      });
    }

    const project = new Project({
      name,
      description,
      color: color || '#3B82F6',
      createdBy: userId,
      members: [userId]
    });

    await project.save();

    // Create default board for the project
    const board = new Board({
      name: `${name} Board`,
      projectId: project._id
    });

    await board.save();

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'username email')
      .populate('members', 'username email avatar');

    return res.status(201).json({
      success: true,
      data: populatedProject
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while creating project' 
    });
  }
};

// PUT /api/projects/:id - Update project
export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const project = await Project.findById(id);
    
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
        error: 'Access denied'
      });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      { 
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(color && { color })
      },
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'username email')
    .populate('members', 'username email avatar');

    return res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while updating project' 
    });
  }
};

// DELETE /api/projects/:id - Delete project
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const project = await Project.findById(id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Only creator can delete project
    if (!project.createdBy.equals(userObjectId)) {
      return res.status(403).json({
        success: false,
        error: 'Only project creator can delete the project'
      });
    }

    await Project.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while deleting project' 
    });
  }
};

// POST /api/projects/:id/members - Add members to project
export const addMembers = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { memberIds } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Member IDs array is required'
      });
    }

    const project = await Project.findById(id);
    
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
        error: 'Access denied'
      });
    }

    // Add new members (avoid duplicates)
    const newMembers = memberIds.filter(memberId => 
      !project.members.some(member => member.equals(new mongoose.Types.ObjectId(memberId)))
    );

    if (newMembers.length > 0) {
      const newMemberObjectIds = newMembers.map(id => new mongoose.Types.ObjectId(id));
      project.members.push(...newMemberObjectIds);
      await project.save();
    }

    const updatedProject = await Project.findById(id)
      .populate('createdBy', 'username email')
      .populate('members', 'username email avatar');

    return res.json({
      success: true,
      data: updatedProject
    });
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while adding members' 
    });
  }
};
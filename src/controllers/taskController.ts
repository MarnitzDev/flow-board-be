import { Response } from 'express';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from '../types/auth';
import Task from '../models/Task';
import Board from '../models/Board';
import Project from '../models/Project';

// GET /api/tasks - Get tasks for authenticated user (with optional filters)
export const getTasks = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { projectId, boardId, status, assignee, priority } = req.query;

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

    // Build query for tasks
    let query: any = {
      projectId: { $in: projectIds }
    };

    // Apply filters if provided
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

    if (boardId) {
      query.boardId = boardId;
    }

    if (status) {
      query.status = status;
    }

    if (assignee) {
      query.assignee = assignee;
    }

    if (priority) {
      query.priority = priority;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .populate('projectId', 'name color')
      .populate('boardId', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching tasks' 
    });
  }
};

// GET /api/tasks/:id - Get a specific task
export const getTaskById = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const task = await Task.findById(id)
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .populate('projectId', 'name color createdBy members')
      .populate('boardId', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has access to the task's project
    const project = task.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    return res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task by ID error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching task' 
    });
  }
};

// POST /api/tasks - Create new task
export const createTask = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { 
      title, 
      description, 
      status = 'todo',
      priority = 'medium',
      assignee,
      projectId,
      boardId,
      columnId,
      labels = [],
      dueDate,
      subtasks = []
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!title || !projectId || !boardId) {
      return res.status(400).json({
        success: false,
        error: 'Title, project ID, and board ID are required'
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

    // Verify board exists and belongs to the project
    const board = await Board.findOne({ _id: boardId, projectId });
    
    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found or does not belong to this project'
      });
    }

    // Create the task
    const task = new Task({
      title,
      description,
      status,
      priority,
      assignee: assignee || null,
      reporter: userId,
      projectId,
      boardId,
      columnId,
      labels,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      subtasks
    });

    await task.save();

    // If columnId is provided, add task to that column
    if (columnId && board.columns) {
      const column = board.columns.find(col => col._id?.toString() === columnId);
      if (column) {
        column.taskIds.push(task._id as any);
        await board.save();
      }
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .populate('projectId', 'name color')
      .populate('boardId', 'name');

    return res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while creating task' 
    });
  }
};

// PUT /api/tasks/:id - Update task
export const updateTask = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const updateData = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const task = await Task.findById(id)
      .populate('projectId', 'createdBy members');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has access to the task's project
    const project = task.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    // Handle column changes for board updates
    const oldColumnId = task.columnId?.toString();
    const newColumnId = updateData.columnId;

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        ...(updateData.dueDate && { dueDate: new Date(updateData.dueDate) })
      },
      { new: true, runValidators: true }
    )
    .populate('assignee', 'username email avatar')
    .populate('reporter', 'username email avatar')
    .populate('projectId', 'name color')
    .populate('boardId', 'name');

    // Update board columns if columnId changed
    if (oldColumnId !== newColumnId && (oldColumnId || newColumnId)) {
      const board = await Board.findById(task.boardId);
      
      if (board && board.columns) {
        // Remove from old column
        if (oldColumnId) {
          const oldColumn = board.columns.find(col => col._id?.toString() === oldColumnId);
          if (oldColumn) {
            oldColumn.taskIds = oldColumn.taskIds.filter(taskId => taskId.toString() !== id);
          }
        }

        // Add to new column
        if (newColumnId) {
          const newColumn = board.columns.find(col => col._id?.toString() === newColumnId);
          if (newColumn && !newColumn.taskIds.some(taskId => taskId.toString() === id)) {
            newColumn.taskIds.push(task._id as any);
          }
        }

        await board.save();
      }
    }

    return res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while updating task' 
    });
  }
};

// PUT /api/tasks/:id/move - Move task between columns (optimized for drag & drop)
export const moveTask = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;
    const { fromColumnId, toColumnId, position } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    if (!fromColumnId || !toColumnId) {
      return res.status(400).json({
        success: false,
        error: 'From and to column IDs are required'
      });
    }

    const task = await Task.findById(id)
      .populate('projectId', 'createdBy members');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has access to the task's project
    const project = task.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    // Update task's columnId
    task.columnId = new mongoose.Types.ObjectId(toColumnId);
    await task.save();

    // Update board columns
    const board = await Board.findById(task.boardId);
    
    if (board && board.columns) {
      // Remove from source column
      const fromColumn = board.columns.find(col => col._id?.toString() === fromColumnId);
      if (fromColumn) {
        fromColumn.taskIds = fromColumn.taskIds.filter(taskId => taskId.toString() !== id);
      }

      // Add to destination column at specified position
      const toColumn = board.columns.find(col => col._id?.toString() === toColumnId);
      if (toColumn) {
        if (typeof position === 'number' && position >= 0) {
          toColumn.taskIds.splice(position, 0, task._id as any);
        } else {
          toColumn.taskIds.push(task._id as any);
        }
      }

      await board.save();
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .populate('projectId', 'name color')
      .populate('boardId', 'name');

    return res.json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error('Move task error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while moving task' 
    });
  }
};

// DELETE /api/tasks/:id - Delete task
export const deleteTask = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const task = await Task.findById(id)
      .populate('projectId', 'createdBy members');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user has access to the task's project
    const project = task.projectId as any;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    if (!project.createdBy.equals(userObjectId) && !project.members.some((member: any) => member.equals(userObjectId))) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this task'
      });
    }

    // Remove task from board column
    if (task.columnId && task.boardId) {
      const board = await Board.findById(task.boardId);
      if (board && board.columns) {
        const column = board.columns.find(col => col._id?.toString() === task.columnId?.toString());
        if (column) {
          column.taskIds = column.taskIds.filter(taskId => taskId.toString() !== id);
          await board.save();
        }
      }
    }

    await Task.findByIdAndDelete(id);

    return res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while deleting task' 
    });
  }
};

// GET /api/tasks/board/:boardId - Get all tasks for a specific board (optimized for kanban)
export const getTasksByBoard = async (req: AuthenticatedRequest, res: Response): Promise<Response> => {
  try {
    const userId = req.user?.userId;
    const { boardId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Verify user has access to the board
    const board = await Board.findById(boardId)
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

    const tasks = await Task.find({ boardId })
      .populate('assignee', 'username email avatar')
      .populate('reporter', 'username email avatar')
      .populate('projectId', 'name color')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks by board error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching board tasks' 
    });
  }
};
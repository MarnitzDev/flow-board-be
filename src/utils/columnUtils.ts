import BoardModel, { IBoard, IColumn } from '../models/Board';

/**
 * Get status display name from column ID
 */
export async function getStatusFromColumnId(columnId: string, boardId: string): Promise<string> {
  try {
    const board = await BoardModel.findById(boardId);
    if (!board || !board.columns) {
      return 'Unknown';
    }

    const column = board.columns.find((col: IColumn) => col._id?.toString() === columnId);
    return column?.name || 'Unknown';
  } catch (error) {
    console.error('Error getting status from column ID:', error);
    return 'Unknown';
  }
}

/**
 * Get column ID from status name (for backward compatibility)
 */
export async function getColumnIdFromStatus(statusName: string, boardId: string): Promise<string | null> {
  try {
    const board = await BoardModel.findById(boardId);
    if (!board || !board.columns) {
      return null;
    }

    // Map common status names to column names
    const statusMapping: { [key: string]: string[] } = {
      'todo': ['To Do', 'Todo', 'Backlog', 'New'],
      'in-progress': ['In Progress', 'In Development', 'Working', 'Active'],
      'done': ['Done', 'Complete', 'Finished', 'Closed']
    };

    const possibleNames = statusMapping[statusName.toLowerCase()] || [statusName];
    
    for (const name of possibleNames) {
      const column = board.columns.find((col: IColumn) => 
        col.name.toLowerCase() === name.toLowerCase()
      );
      if (column) {
        return column._id?.toString() || null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting column ID from status:', error);
    return null;
  }
}

/**
 * Get default column ID for new tasks (usually the first column)
 */
export async function getDefaultColumnId(boardId: string): Promise<string | null> {
  try {
    const board = await BoardModel.findById(boardId);
    if (!board || !board.columns || board.columns.length === 0) {
      return null;
    }

    // Return the first column (usually "To Do" or "Backlog")
    const firstColumn = board.columns[0];
    return firstColumn?._id?.toString() || null;
  } catch (error) {
    console.error('Error getting default column ID:', error);
    return null;
  }
}
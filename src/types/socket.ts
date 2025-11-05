import { Types } from 'mongoose';

export interface SocketUser {
  userId: string;
  username: string;
}

export interface TaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  projectId: string;
  boardId: string;
  columnId?: string;
  labels?: Array<{ name: string; color: string }>;
  dueDate?: string;
  subtasks?: Array<{ title: string; completed: boolean }>;
}

export interface MoveTaskData {
  taskId: string;
  fromColumnId: string;
  toColumnId: string;
  position?: number;
  boardId: string;
}

export interface TaskCreatedEvent {
  task: any;
  createdBy: SocketUser;
  timestamp: Date;
}

export interface TaskUpdatedEvent {
  task: any;
  updatedBy: SocketUser;
  changes: Partial<TaskData>;
  timestamp: Date;
}

export interface TaskDeletedEvent {
  taskId: string;
  deletedBy: SocketUser;
  timestamp: Date;
}

export interface TaskMovedEvent {
  task: any;
  fromColumnId: string;
  toColumnId: string;
  position?: number | undefined;
  boardId: string;
  movedBy: SocketUser;
  timestamp: Date;
}

export interface UserJoinedEvent {
  userId: string;
  username: string;
  boardId: string;
  timestamp: Date;
}

export interface UserLeftEvent {
  userId: string;
  username?: string;
  boardId: string;
  timestamp: Date;
}

export interface UserTypingEvent {
  userId: string;
  username: string;
  taskId: string;
  timestamp: Date;
}

export interface UserStopTypingEvent {
  userId: string;
  taskId: string;
  timestamp: Date;
}

export interface BoardColumnsUpdatedEvent {
  boardId: string;
  columns: any[];
  updatedBy: SocketUser;
  timestamp: Date;
}

export interface CursorMoveEvent {
  x: number;
  y: number;
  boardId: string;
}

export interface CursorMovedEvent {
  userId: string;
  username: string;
  x: number;
  y: number;
  timestamp: Date;
}

export interface SocketErrorEvent {
  message: string;
  error?: string;
}

// Server to Client Events
export interface ServerToClientEvents {
  // Task events
  'task:created': (data: TaskCreatedEvent) => void;
  'task:updated': (data: TaskUpdatedEvent) => void;
  'task:deleted': (data: TaskDeletedEvent) => void;
  'task:moved': (data: TaskMovedEvent) => void;
  
  // User presence events
  'user:joined': (data: UserJoinedEvent) => void;
  'user:left': (data: UserLeftEvent) => void;
  'user:typing': (data: UserTypingEvent) => void;
  'user:stop_typing': (data: UserStopTypingEvent) => void;
  'user:cursor_moved': (data: CursorMovedEvent) => void;
  
  // Board events
  'board:columns_updated': (data: BoardColumnsUpdatedEvent) => void;
  
  // Error events
  'error': (data: SocketErrorEvent) => void;
}

// Client to Server Events
export interface ClientToServerEvents {
  // Board management
  'join:board': (boardId: string) => void;
  'leave:board': (boardId: string) => void;
  
  // Task operations
  'task:create': (taskData: TaskData) => void;
  'task:update': (taskId: string, updates: Partial<TaskData>) => void;
  'task:delete': (taskId: string) => void;
  'task:move': (moveData: MoveTaskData) => void;
  
  // User interactions
  'user:start_typing': (data: { taskId: string }) => void;
  'user:stop_typing': (data: { taskId: string }) => void;
  'user:cursor_move': (data: CursorMoveEvent) => void;
  
  // Board updates
  'board:update_columns': (boardId: string, columns: any[]) => void;
}

// Inter-server Events (for scaling with multiple servers)
export interface InterServerEvents {
  ping: () => void;
}

// Socket Data
export interface SocketData {
  userId: string;
  username: string;
  currentBoard?: string;
}
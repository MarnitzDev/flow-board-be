import mongoose, { Document, Schema } from 'mongoose';

export interface ILabel {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
}

export interface ISubtask {
  _id: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export interface ITask extends Document {
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: mongoose.Types.ObjectId;
  reporter: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId; // This IS the status - references board column
  collectionId?: mongoose.Types.ObjectId; // Optional grouping within project
  parentTaskId?: mongoose.Types.ObjectId; // For subtasks - references parent task
  labels: ILabel[];
  dueDate?: Date;
  subtasks: ISubtask[];
  timeTracked: number;
  dependencies: mongoose.Types.ObjectId[];
  isSubtask: boolean; // Helps distinguish subtasks from main tasks
  order: number; // For ordering tasks within collections/columns
  createdAt: Date;
  updatedAt: Date;
}

const LabelSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  color: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  }
});

const SubtaskSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const TaskSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  assignee: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  columnId: {
    type: Schema.Types.ObjectId,
    ref: 'Board.columns',
    required: true,
    index: true // For efficient filtering by column
  },
  collectionId: {
    type: Schema.Types.ObjectId,
    ref: 'Collection',
    required: false,
    index: true // For efficient filtering by collection
  },
  parentTaskId: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: false,
    index: true // For efficient subtask queries
  },
  isSubtask: {
    type: Boolean,
    default: false,
    index: true // For efficient filtering between tasks and subtasks
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  labels: {
    type: [LabelSchema],
    default: []
  },
  dueDate: {
    type: Date
  },
  subtasks: {
    type: [SubtaskSchema],
    default: []
  },
  timeTracked: {
    type: Number,
    default: 0,
    min: 0
  },
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
TaskSchema.index({ projectId: 1, isSubtask: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ reporter: 1 });
TaskSchema.index({ boardId: 1, columnId: 1 });
TaskSchema.index({ collectionId: 1, order: 1 });
TaskSchema.index({ parentTaskId: 1 }); // For finding subtasks
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ projectId: 1, collectionId: 1, isSubtask: 1 }); // Compound index for grouping

export default mongoose.model<ITask>('Task', TaskSchema);
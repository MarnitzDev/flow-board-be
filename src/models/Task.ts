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
  labels: ILabel[];
  dueDate?: Date;
  subtasks: ISubtask[];
  timeTracked: number;
  dependencies: mongoose.Types.ObjectId[];
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
TaskSchema.index({ projectId: 1, status: 1 });
TaskSchema.index({ assignee: 1 });
TaskSchema.index({ reporter: 1 });
TaskSchema.index({ boardId: 1, columnId: 1 });
TaskSchema.index({ dueDate: 1 });

export default mongoose.model<ITask>('Task', TaskSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IColumn {
  _id: mongoose.Types.ObjectId;
  name: string;
  color: string;
  order: number;
  taskIds: mongoose.Types.ObjectId[];
}

export interface IBoard extends Document {
  name: string;
  projectId: mongoose.Types.ObjectId;
  columns: IColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  color: {
    type: String,
    required: true,
    default: '#6B7280',
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  taskIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }]
});

const BoardSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  columns: {
    type: [ColumnSchema],
    default: [
      { name: 'To Do', color: '#EF4444', order: 0, taskIds: [] },
      { name: 'In Progress', color: '#F59E0B', order: 1, taskIds: [] },
      { name: 'Done', color: '#10B981', order: 2, taskIds: [] }
    ]
  }
}, {
  timestamps: true
});

// Index for better query performance
BoardSchema.index({ projectId: 1 });

export default mongoose.model<IBoard>('Board', BoardSchema);
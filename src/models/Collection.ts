import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  description?: string;
  color: string;
  projectId: mongoose.Types.ObjectId;
  order: number;
  isArchived: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  color: {
    type: String,
    required: true,
    match: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
    default: '#6366F1'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true
  },
  order: {
    type: Number,
    default: 0,
    min: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CollectionSchema.index({ projectId: 1, order: 1 });
CollectionSchema.index({ projectId: 1, isArchived: 1 });
CollectionSchema.index({ createdBy: 1 });

// Ensure unique collection names within a project
CollectionSchema.index({ projectId: 1, name: 1 }, { unique: true });

export default mongoose.model<ICollection>('Collection', CollectionSchema);
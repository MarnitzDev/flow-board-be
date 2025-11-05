import mongoose, { Document, Schema } from 'mongoose';

export interface IAttachment extends Document {
  filename: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const AttachmentSchema: Schema = new Schema({
  filename: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0,
    max: 50 * 1024 * 1024 // 50MB limit
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Index for better query performance
AttachmentSchema.index({ taskId: 1, createdAt: -1 });
AttachmentSchema.index({ uploadedBy: 1 });

export default mongoose.model<IAttachment>('Attachment', AttachmentSchema);
import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  title: string;
  description: string;
  category: 'Bug' | 'Feature Request' | 'Improvement' | 'Other';
  status: 'New' | 'In Review' | 'Resolved';
  submitterName?: string;
  submitterEmail?: string;
  aiCategory?: string;
  aiSentiment?: 'Positive' | 'Neutral' | 'Negative';
  aiPriority?: number;
  aiSummary?: string;
  aiTags?: string[];
  aiProcessed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      maxlength: [120, 'Title cannot exceed 120 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Bug', 'Feature Request', 'Improvement', 'Other'],
      required: [true, 'Category is required'],
    },
    status: {
      type: String,
      enum: ['New', 'In Review', 'Resolved'],
      default: 'New',
    },
    submitterName: {
      type: String,
      trim: true,
    },
    submitterEmail: {
      type: String,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    aiCategory: { type: String },
    aiSentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
    },
    aiPriority: {
      type: Number,
      min: 1,
      max: 10,
    },
    aiSummary: { type: String },
    aiTags: [{ type: String }],
    aiProcessed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// MongoDB indexes for query performance
FeedbackSchema.index({ status: 1 });
FeedbackSchema.index({ category: 1 });
FeedbackSchema.index({ aiPriority: -1 });
FeedbackSchema.index({ createdAt: -1 });

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
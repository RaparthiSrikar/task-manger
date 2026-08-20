import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Task {
  _id: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true, default: '' })
  description: string;

  @Prop({ type: String, enum: TaskStatus, default: TaskStatus.TODO })
  status: TaskStatus;

  @Prop({ type: String, enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Prop()
  dueDate?: Date;

  // Free-text place name, e.g. "Hyderabad, IN" — resolved against the
  // weather API on read rather than storing coordinates.
  @Prop({ trim: true })
  location?: string;

  @Prop()
  attachmentUrl?: string;

  // Cloudinary public_id, kept so we can delete the asset on task delete/replace
  @Prop()
  attachmentPublicId?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Compound indexes to make the common dashboard queries (my tasks, filtered
// by status, sorted by due date) fast without a full collection scan.
TaskSchema.index({ user: 1, status: 1 });
TaskSchema.index({ user: 1, dueDate: 1 });

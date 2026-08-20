import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { EmailService } from '../email/email.service';
import { UploadService } from '../upload/upload.service';
import { UsersService } from '../users/users.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskDocument, TaskStatus } from './schemas/task.schema';

export interface PaginatedTasks {
  items: TaskDocument[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    private emailService: EmailService,
    private uploadService: UploadService,
    private usersService: UsersService,
  ) {}

  async create(userId: string, dto: CreateTaskDto): Promise<TaskDocument> {
    const task = await this.taskModel.create({ ...dto, user: userId });

    // Fire-and-forget: a slow/broken mail provider must never block task creation.
    const user = await this.usersService.findById(userId);
    if (user) {
      void this.emailService.sendTaskCreatedEmail(user.email, user.name, task.title);
    }

    return task;
  }

  async findAll(userId: string, query: QueryTaskDto): Promise<PaginatedTasks> {
    const filter: FilterQuery<TaskDocument> = { user: userId };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (query.dueDateFrom || query.dueDateTo) {
      filter.dueDate = {
        ...(query.dueDateFrom ? { $gte: new Date(query.dueDateFrom) } : {}),
        ...(query.dueDateTo ? { $lte: new Date(query.dueDateTo) } : {}),
      };
    }

    if (query.search) {
      const regex = new RegExp(escapeRegex(query.search), 'i');
      filter.$or = [{ title: regex }, { description: regex }];
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      this.taskModel
        .find(filter)
        .sort({ [query.sortBy ?? 'createdAt']: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.taskModel.countDocuments(filter),
    ]);

    return {
      items,
      meta: { total, page, limit, totalPages: Math.max(Math.ceil(total / limit), 1) },
    };
  }

  async findOne(userId: string, id: string): Promise<TaskDocument> {
    this.assertValidId(id);
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    this.assertOwnership(task, userId);
    return task;
  }

  async update(userId: string, id: string, dto: UpdateTaskDto): Promise<TaskDocument> {
    const task = await this.findOne(userId, id);
    const wasNotDone = task.status !== TaskStatus.DONE;

    Object.assign(task, dto);
    await task.save();

    if (wasNotDone && task.status === TaskStatus.DONE) {
      const user = await this.usersService.findById(userId);
      if (user) {
        void this.emailService.sendTaskCompletedEmail(user.email, user.name, task.title);
      }
    }

    return task;
  }

  async remove(userId: string, id: string): Promise<void> {
    const task = await this.findOne(userId, id);
    if (task.attachmentPublicId) {
      await this.uploadService.deleteFile(task.attachmentPublicId);
    }
    await task.deleteOne();
  }

  async attachFile(userId: string, id: string, file?: Express.Multer.File): Promise<TaskDocument> {
    if (!file) {
      throw new BadRequestException('No file was uploaded (expected field name "file")');
    }

    const task = await this.findOne(userId, id);

    // Replace: drop the old asset so we don't leak storage on repeated uploads.
    if (task.attachmentPublicId) {
      await this.uploadService.deleteFile(task.attachmentPublicId);
    }

    const { url, publicId } = await this.uploadService.uploadFile(file);
    task.attachmentUrl = url;
    task.attachmentPublicId = publicId;
    await task.save();

    return task;
  }

  private assertValidId(id: string): void {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Task not found');
    }
  }

  private assertOwnership(task: TaskDocument, userId: string): void {
    if (task.user.toString() !== userId) {
      // 403 rather than leaking existence via a 404 vs 403 timing difference is a
      // reasonable trade-off here; NotFound would also be defensible.
      throw new ForbiddenException('You do not have access to this task');
    }
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

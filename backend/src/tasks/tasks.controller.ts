import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { WeatherService } from '../weather/weather.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024; // 5 MB

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private weatherService: WeatherService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a task (sends a confirmation email)' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List the current user\'s tasks — paginated & filterable' })
  findAll(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryTaskDto) {
    return this.tasksService.findAll(user.userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one task, enriched with live weather for its location' })
  async findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const task = await this.tasksService.findOne(user.userId, id);
    const weather = task.location ? await this.weatherService.getCurrentWeather(task.location) : null;
    return { ...task.toObject(), weather };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (sends a "done" notification email on completion)' })
  update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task and its attachment, if any' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.tasksService.remove(user.userId, id);
  }

  @Post(':id/attachment')
  @ApiOperation({ summary: 'Attach/replace a file or image on a task' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_ATTACHMENT_BYTES } }))
  attachFile(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.tasksService.attachFile(user.userId, id, file);
  }
}

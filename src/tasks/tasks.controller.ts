import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { FindOneParams } from './dtos/find-one-params.dto';
import { UpdateTaskStatus } from './dtos/update-task-status.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { Task } from './entities/task.entity';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { FindTaskParams } from './dtos/find-task.params.dto';
import { PaginationParams } from 'src/common/pagination.response';
import { PaginationResponse } from 'src/common/pagination.params.dto';

@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public async findAll(
    @Query() filter: FindTaskParams,
    @Query() pagination: PaginationParams,
  ): Promise<PaginationResponse<Task>> {
    const [task, count] = await this.tasksService.findAll(filter, pagination);

    return {
      data: task,
      meta: {
        total: count,
        ...pagination,
      },
    };
  }

  @Get('/:id')
  public findOne(@Param() params: FindOneParams): Promise<Task> {
    return this.tasksService.findOne(params.id);
  }

  @Post()
  public create(@Body() data: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(data);
  }

  @Patch('/:id/status')
  public updateStatus(
    @Param() params: FindOneParams,
    @Body() data: UpdateTaskStatus,
  ): Promise<Task> {
    if (!data?.status) {
      throw new BadRequestException();
    }
    return this.tasksService.updateStatus(params.id, data.status);
  }

  @Patch('/:id')
  public updateTask(
    @Param() params: FindOneParams,
    @Body() data: UpdateTaskDto,
  ): Promise<Task> {
    if (data?.title || data?.description || data?.status) {
      try {
        return this.tasksService.updateTask(params.id, data);
      } catch (error) {
        if (error instanceof WrongTaskStatusException) {
          throw new BadRequestException([error.message]);
        }
        throw error;
      }
    }
    throw new BadRequestException();
  }
  @Delete('/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public deleteTask(@Param() params: FindOneParams): Promise<void> {
    return this.tasksService.deleteTask(params.id);
  }

  @Post(':id/labels')
  public addLabels(
    @Param() { id }: FindOneParams,
    @Body() labels: CreateTaskLabelDto[],
  ): Promise<Task> {
    return this.tasksService.addLabels(id, labels);
  }

  @Delete(':id/labels')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async removeLabels(
    @Param() { id }: FindOneParams,
    @Body() labels: string[],
  ): Promise<void> {
    await this.tasksService.removeLabels(id, labels);
  }
}

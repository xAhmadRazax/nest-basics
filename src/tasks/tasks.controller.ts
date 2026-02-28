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
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { TaskInterface } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { FindOneParams } from './dtos/find-one-params.dto';
import { UpdateTaskStatus } from './dtos/update-task-status.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public findAll(): TaskInterface[] {
    return this.tasksService.findAll();
  }

  @Get('/:id')
  public findOne(@Param() params: FindOneParams): TaskInterface {
    return this.tasksService.findOne(params.id);
  }

  @Post()
  public create(@Body() data: CreateTaskDto) {
    return this.tasksService.create(data);
  }

  @Patch('/:id/status')
  public updateStatus(
    @Param() params: FindOneParams,
    @Body() data: UpdateTaskStatus,
  ) {
    if (!data?.status) {
      throw new BadRequestException();
    }
    return this.tasksService.updateStatus(params.id, data.status);
  }

  @Patch('/:id')
  public updateTask(
    @Param() params: FindOneParams,
    @Body() data: UpdateTaskDto,
  ) {
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
  public deleteTask(@Param() params: FindOneParams) {
    return this.tasksService.deleteTask(params.id);
  }
}

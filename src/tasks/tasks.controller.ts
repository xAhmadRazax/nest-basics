import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import type { TaskInterface } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';

@Controller({ path: 'tasks', version: '1' })
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  public findAll(): TaskInterface[] {
    return this.tasksService.findAll();
  }

  @Get('/:id')
  public findOne(@Param('id') id: string): TaskInterface {
    return this.tasksService.findOne(id);
  }

  @Post()
  public create(@Body() data: CreateTaskDto) {
    return this.tasksService.Create(data);
  }
}

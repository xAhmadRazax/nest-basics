import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskInterface, TaskStatus } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TasksService {
  private tasks: TaskInterface[] = [];
  public findAll(): TaskInterface[] {
    return this.tasks;
  }

  public findOne(id: string): TaskInterface | never {
    const task = this.tasks.find((task) => task.id === id);
    if (!task) throw new NotFoundException('Not Task found with the given id');
    return task;
  }

  public Create(data: CreateTaskDto): TaskInterface {
    const task: TaskInterface = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }
}

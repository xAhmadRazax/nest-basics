import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskInterface, TaskStatus } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { randomUUID } from 'crypto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';

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

  public create(data: CreateTaskDto): TaskInterface {
    const task: TaskInterface = {
      id: randomUUID(),
      title: data.title,
      description: data.description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);
    return task;
  }

  public updateStatus(id: string, status: TaskStatus): TaskInterface {
    let updatedTask: TaskInterface | undefined;

    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        if (!this.isValidStatusTransition(task.status, status)) {
          throw new WrongTaskStatusException();
        }
        task.status = status;
        updatedTask = task;
      }

      return task;
    });
    if (!updatedTask?.id) {
      throw new NotFoundException('Not Task found with the given id');
    }
    return updatedTask;
  }

  public updateTask(id: string, data: UpdateTaskDto): TaskInterface {
    let updatedTask: TaskInterface | undefined;
    const dataToUpdate = data;
    for (const p in dataToUpdate) {
      if (dataToUpdate[p as keyof UpdateTaskDto] === undefined) {
        delete dataToUpdate[p as keyof UpdateTaskDto];
      }
    }
    this.tasks = this.tasks.map((task) => {
      if (task.id === id) {
        if (
          dataToUpdate.status &&
          !this.isValidStatusTransition(task.status, dataToUpdate.status)
        ) {
          throw new WrongTaskStatusException();
        }
        updatedTask = {
          ...task,
          ...dataToUpdate,
        };
        return updatedTask;
      } else {
        return task;
      }
    });
    if (!updatedTask?.id) {
      throw new NotFoundException('Not Task found with the given id');
    }
    return updatedTask;
  }

  public deleteTask(id: string): void {
    this.tasks = this.tasks.filter((task) => task.id !== id);
  }

  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const orderStatus = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    return orderStatus.indexOf(currentStatus) <= orderStatus.indexOf(newStatus);
  }
}

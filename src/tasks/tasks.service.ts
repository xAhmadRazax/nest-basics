import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  public findAll(): Promise<Task[]> {
    return this.taskRepository.find();
  }

  public async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'],
    });
    if (!task) throw new NotFoundException('Not Task found with the given id');
    return task;
  }

  public createTask(data: CreateTaskDto): Promise<Task> {
    return this.taskRepository.save({ ...data });
  }

  public async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const taskToUpdate = await this.taskRepository.findOneBy({ id });
    if (!taskToUpdate?.id)
      throw new NotFoundException('Not task found with the given id');
    if (!this.isValidStatusTransition(taskToUpdate.status, status)) {
      throw new WrongTaskStatusException();
    }

    return this.taskRepository.save({ ...taskToUpdate, status });
  }

  public async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    const dataToUpdate = data;
    for (const p in dataToUpdate) {
      if (dataToUpdate[p as keyof UpdateTaskDto] === undefined) {
        delete dataToUpdate[p as keyof UpdateTaskDto];
      }
    }

    const taskToUpdate = await this.taskRepository.findOneBy({ id });
    if (!taskToUpdate?.id)
      throw new NotFoundException('Not task found with the given id');
    if (
      dataToUpdate.status &&
      !this.isValidStatusTransition(dataToUpdate?.status, taskToUpdate.status)
    ) {
      throw new WrongTaskStatusException();
    }

    return this.taskRepository.save({ ...taskToUpdate, ...dataToUpdate });
  }

  public async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task.model';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { WrongTaskStatusException } from './exceptions/wrong-task-status.exception';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { CreateTaskLabelDto } from './dtos/create-task-label.dto';
import { TaskLabel } from './entities/task-label.entity';
import { FindTaskParams } from './dtos/find-task.params.dto';
import { PaginationParams } from 'src/common/pagination.response';

@Injectable()
export class TasksService {
  constructor(
    // Injecting the Task repository for database operations
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    // Injecting the Task labels repository for database operations
    @InjectRepository(TaskLabel)
    private readonly LabelsRepository: Repository<TaskLabel>,
  ) {}

  /**
   * Get all tasks from the database
   */
  public findAll(
    filter: FindTaskParams,
    pagination: PaginationParams,
  ): Promise<[Task[], number]> {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.labels', 'label');

    if (filter.status) {
      query.andWhere('task.status=:status', { status: filter.status });
    }

    if (filter.search?.trim()) {
      query.andWhere(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    if (filter.labels?.length) {
      const subQuery = query
        .subQuery()
        .select('label.taskId')
        .from('task_label', 'label')
        .where('labels.name IN (:...names)', { names: filter.labels })
        .getQuery();

      query.andWhere(`task.id IN ${subQuery}`);

      // query.andWhere('label.name IN (:...names)', {
      //   names: filter.labels,
      // });
    }

    query.orderBy(`task.${filter.sortBy}`, filter.sortOrder);

    query.skip(pagination.offset).take(pagination.limit);

    return query.getManyAndCount();
    // const where: FindOptionsWhere<Task> = {};

    // if (filter.status) {
    //   where.status = filter.status;
    // }
    // if (filter.search?.trim()) {
    //   where.title = Like(`%${filter.search}%`);
    //   where.description = Like(`%${filter.search}%`);
    // }
    // return this.taskRepository.findAndCount({
    //   where,
    //   relations: ['labels'],
    //   skip: pagination.offset,
    //   take: pagination.limit,
    // });
  }

  /**
   * Find a single task by its ID
   * @param id - ID of the task
   * @throws NotFoundException if task does not exist
   */
  public async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id },
      relations: ['labels'], // Include task labels in the result
    });
    if (!task) throw new NotFoundException('No Task found with the given id');
    return task;
  }

  /**
   * Create a new task
   * @param data - DTO containing task information
   */
  public createTask(data: CreateTaskDto): Promise<Task> {
    if (data?.labels) {
      data.labels = this.getUniqueLabels(data.labels);
    }
    return this.taskRepository.save(data);
  }

  /**
   * Update the status of a task
   * @param id - Task ID
   * @param status - New status
   * @throws NotFoundException if task does not exist
   * @throws WrongTaskStatusException if the status transition is invalid
   */
  public async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const taskToUpdate = await this.taskRepository.findOneBy({ id });
    if (!taskToUpdate?.id)
      throw new NotFoundException('No task found with the given id');

    // Validate that the new status follows the allowed workflow
    if (!this.isValidStatusTransition(taskToUpdate.status, status)) {
      throw new WrongTaskStatusException();
    }

    return this.taskRepository.save({ ...taskToUpdate, status });
  }

  /**
   * Update task fields
   * Handles partial updates and status validation
   * @param id - Task ID
   * @param data - Partial data to update
   */
  public async updateTask(id: string, data: UpdateTaskDto): Promise<Task> {
    // Remove undefined properties to avoid overwriting existing fields
    const dataToUpdate = { ...data };
    for (const p in dataToUpdate) {
      if (dataToUpdate[p as keyof UpdateTaskDto] === undefined) {
        delete dataToUpdate[p as keyof UpdateTaskDto];
      }
    }

    const taskToUpdate = await this.taskRepository.findOneBy({ id });
    if (!taskToUpdate?.id)
      throw new NotFoundException('No task found with the given id');

    // Validate status transition if status is being updated
    if (
      dataToUpdate.status &&
      !this.isValidStatusTransition(taskToUpdate.status, dataToUpdate.status)
    ) {
      throw new WrongTaskStatusException();
    }

    if (data?.labels) {
      data.labels = this.getUniqueLabels(data.labels);
    }

    return this.taskRepository.save({ ...taskToUpdate, ...dataToUpdate });
  }

  /**
   * Delete a task by ID
   * @param id - Task ID
   */
  public async deleteTask(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }

  /**
   *
   * add new labels to existing task s
   * @param taskId - Task Id
   * @param labelsDto - Labels
   * @returns tasks
   */
  public async addLabels(
    taskId: string,
    labelsDto: CreateTaskLabelDto[],
  ): Promise<Task> {
    const task = await this.findOne(taskId);

    // getting unique names of task labels for checking
    const names = new Set(task.labels.map((label) => label.name));

    // first make user input labels unique
    const labels = this.getUniqueLabels(labelsDto)
      // check for input label against existing one
      .filter((dto) => !names.has(dto.name))
      // creating them
      .map((label) => this.LabelsRepository.create(label));

    if (labels.length) {
      task.labels = [...task.labels, ...labels];

      return this.taskRepository.save(task);
    }
    return task;
  }

  public async removeLabels(taskId: string, labelToRemove: string[]) {
    const task = await this.findOne(taskId);

    task.labels = task.labels.filter(
      (tLabel) => !labelToRemove.includes(tLabel.name),
    );

    return this.taskRepository.save(task);
  }

  /**
   * Validate if a task status transition is allowed
   * Ensures workflow: OPEN -> IN_PROGRESS -> DONE
   * @param currentStatus - Current task status
   * @param newStatus - New task status
   */
  private isValidStatusTransition(
    currentStatus: TaskStatus,
    newStatus: TaskStatus,
  ): boolean {
    const orderStatus = [
      TaskStatus.OPEN,
      TaskStatus.IN_PROGRESS,
      TaskStatus.DONE,
    ];

    // Returns true if newStatus is same or later in the workflow
    return orderStatus.indexOf(currentStatus) <= orderStatus.indexOf(newStatus);
  }

  /**
   * remove duplicates labels from list
   * @param labelDto
   * @returns
   */
  private getUniqueLabels(
    labelDto: CreateTaskLabelDto[],
  ): CreateTaskLabelDto[] {
    return [...new Set(labelDto.map((l) => l.name))].map((name) => ({
      name,
    }));
  }
}

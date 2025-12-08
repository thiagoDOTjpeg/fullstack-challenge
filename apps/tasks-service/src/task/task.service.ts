import { CreateTaskDto } from '@challenge/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) { }

  async create(dto: CreateTaskDto & { creator_id: string }): Promise<Task> {
    return await this.taskRepository.save(dto)
  }

  async assignUser(data: { task_id: string, user_id: string, assigner_id: string }) {
    const task = await this.taskRepository.findOne({ where: { id: data.task_id } });

    if (!task) throw new NotFoundException();

    if (!task.assignees) {
      task.assignees = [];
    }

    if (!task.assignees.includes(data.user_id)) {
      task.assignees.push(data.user_id);
      await this.taskRepository.save(task);
    }

    return task;
  }
}

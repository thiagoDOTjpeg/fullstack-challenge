import { CreateTaskDto } from '@challenge/types';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(@InjectRepository(Task) private taskRepository: Repository<Task>) { }

  async create(dto: CreateTaskDto & { creator_id: string }): Promise<Task> {
    return await this.taskRepository.save(dto)
  }
}

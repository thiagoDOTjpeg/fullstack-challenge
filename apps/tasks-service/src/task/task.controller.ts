import { CreateTaskDto, PaginationQueryDto } from '@challenge/types';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskService } from './task.service';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) { }

  @MessagePattern("tasks.create")
  create(@Payload() dto: CreateTaskDto & { creator_id: string }) {
    return this.taskService.create(dto)
  }

  @MessagePattern('task.assign_user')
  assignUser(@Payload() data: { task_id: string, user_id: string, assigner_id: string }) {
    return this.taskService.assignUser(data);
  }

  @MessagePattern('task.comment')
  comment(@Payload() data: { task_id: string, author_id: string, content: string }) {
    return this.taskService.comment(data);
  }

  @MessagePattern('task.find_all')
  getAll(@Payload() pagination: PaginationQueryDto) {
    return this.taskService.getAll(pagination);
  }

  @MessagePattern('task.find_one')
  getById(@Payload() task_id: string) {
    return this.taskService.getById(task_id);
  }
}

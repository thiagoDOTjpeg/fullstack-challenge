import { CreateTaskDto } from '@challenge/types';
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
}

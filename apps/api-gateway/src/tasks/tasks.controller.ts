import { CreateTaskDto, TaskStatus } from '@challenge/types';
import { Body, Controller, Inject, Post, Req } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("tasks")
@Controller("/api/tasks")
export class TasksController {
  constructor(@Inject("TASKS_SERVICE") private readonly tasksClient: ClientProxy) { }

  @Post()
  createTask(@Body() dto: CreateTaskDto, @Req() req) {
    const payload = {
      ...dto,
      creatorId: req.user.id,
      status: dto.status || TaskStatus.TODO
    };
    return this.tasksClient.send("create_task", payload);
  }
}

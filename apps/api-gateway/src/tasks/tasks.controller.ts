import { AssignTaskDto, CreateTaskDto } from '@challenge/types';
import { Body, Controller, Inject, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';

@ApiTags("tasks")
@Controller("/api/tasks")
export class TasksController {
  constructor(@Inject("TASKS_SERVICE") private readonly tasksClient: ClientProxy) { }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  createTask(@Body() dto: CreateTaskDto, @Req() req: any) {
    const payload = {
      ...dto,
      creator_id: req.user.id
    };
    return this.tasksClient.send("tasks.create", payload);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("/:id/assign")
  assignUser(@Body() dto: AssignTaskDto, @Param("id") task_id: string, @Req() req: any) {
    const payload = {
      user_id: dto.user_id,
      task_id,
      assigner_id: req.user.id
    };
    return this.tasksClient.send("task.assign_user", payload);
  }
}

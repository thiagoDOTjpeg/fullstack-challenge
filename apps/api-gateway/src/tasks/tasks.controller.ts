import { CreateTaskDto } from '@challenge/types';
import { Body, Controller, Inject, Post, Req, UseGuards } from '@nestjs/common';
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
}

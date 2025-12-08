import { AssignTaskDto, CreateCommentDto, CreateTaskDto, PaginationQueryDto } from '@challenge/types';
import { Body, Controller, Get, Inject, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

@ApiTags("tasks")
@ApiBearerAuth()
@Controller("/api/tasks")
export class TasksController {
  constructor(@Inject("TASKS_SERVICE") private readonly tasksClient: ClientProxy) { }

  @UseGuards(AuthGuard("jwt"))
  @Post()
  @ApiOperation({ summary: 'Criar uma nova tarefa' })
  @ApiResponse({ status: 201, description: 'Tarefa criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  createTask(@Body() dto: CreateTaskDto, @Req() req: any) {
    const payload = {
      ...dto,
      creator_id: req.user.id
    };
    return this.tasksClient.send("tasks.create", payload);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("/:id/assign")
  @ApiOperation({ summary: 'Atribuir um usuário a uma tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa (UUID)', example: 'uuid-v4' })
  @ApiResponse({ status: 201, description: 'Usuário atribuído com sucesso.' })
  @ApiResponse({ status: 404, description: 'Tarefa ou Usuário não encontrados.' })
  assignUser(@Body() dto: AssignTaskDto, @Param("id") task_id: string, @Req() req: any) {
    const payload = {
      user_id: dto.user_id,
      task_id,
      assigner_id: req.user.id
    };
    return this.tasksClient.send("task.assign_user", payload);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("/:id/comment")
  @ApiOperation({ summary: 'Adicionar um comentário na tarefa' })
  @ApiParam({ name: 'id', description: 'ID da tarefa (UUID)' })
  @ApiResponse({ status: 201, description: 'Comentário adicionado.' })
  comment(@Body() dto: CreateCommentDto, @Param("id") task_id: string, @Req() req: any) {
    const payload = {
      task_id,
      author_id: req.user.id,
      content: dto.content
    };
    return this.tasksClient.send("task.comment", payload);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get(":id")
  @ApiOperation({ summary: 'Buscar tarefa por ID' })
  @ApiParam({ name: 'id', description: 'ID da tarefa (UUID)' })
  @ApiResponse({ status: 200, description: 'Tarefa encontrada.' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada.' })
  getById(@Param("id", ParseUUIDPipe) id: string) {
    return this.tasksClient.send("task.find_one", id);
  }

  @UseGuards(AuthGuard("jwt"))
  @Get()
  @ApiOperation({ summary: 'Listar tarefas com paginação' })
  @ApiResponse({ status: 200, description: 'Lista de tarefas retornada.' })
  getAll(@Query() pagination: PaginationQueryDto) {
    return this.tasksClient.send('task.find_all', pagination);
  }
}
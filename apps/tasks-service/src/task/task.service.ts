import { AssignTaskPayload, CreateCommentPayload, CreateTaskPayload, PaginationQueryPayload, PaginationResultDto, TaskNotificationPayload, UpdateTaskPayload } from '@challenge/types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @Inject("NOTIFICATION_SERVICE") private readonly notificationClient: ClientProxy,
    private readonly commentService: CommentService
  ) { }

  async create(dto: CreateTaskPayload): Promise<Task> {
    return await this.taskRepository.save(dto)
  }

  async update(data: UpdateTaskPayload): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } });
    if (!task) throw new NotFoundException("Task não encontrada");

    Object.assign(task, data)

    const updatedTask = await this.taskRepository.save(task);

    this.notificationClient.emit("task.updated", updatedTask);

    return updatedTask;
  }

  async getAll(pagination: PaginationQueryPayload): Promise<PaginationResultDto<Task[]>> {
    const { limit = 10, page = 1 } = pagination;

    const skip = (page - 1) * limit;

    const [users, totalTasks] = await this.taskRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      items: users,
      data: {
        totalItems: totalTasks,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalTasks / limit),
        currentPage: page,
      },
    };
  }

  async getById(task_id: string): Promise<Task> {
    const query = this.taskRepository.createQueryBuilder("task")
      .leftJoinAndSelect("task.comments", "comments")
      .andWhere("task.id = :id", { id: task_id })
    const task = await query.getOne();
    if (!task) throw new NotFoundException();
    return task;
  }

  async assignUser(data: AssignTaskPayload): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } });

    if (!task) throw new NotFoundException();

    if (!task.assignees) {
      task.assignees = [];
    }

    if (!task.assignees.includes(data.assigneeId)) {
      task.assignees.push(data.assigneeId);
      const savedTask = await this.taskRepository.save(task);
      const payload: TaskNotificationPayload = {
        recipients: [data.assigneeId],
        task: {
          id: savedTask.id,
          assigneeIds: savedTask.assignees,
          status: savedTask.status,
          title: savedTask.title,
          description: savedTask.description,
        },
        action: "ASSIGNED"
      }
      this.notificationClient.emit("task.assigned", payload)
    }
    return task;
  }

  async comment(data: CreateCommentPayload): Promise<Comment> {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } })
    if (!task) throw new NotFoundException();

    const createdComment = await this.commentService.create(data);

    let recipients: string[] = []

    if (task.assignees) {
      for (const assignee of task.assignees) {
        recipients.push(assignee);
      }

    }

    const payload: TaskNotificationPayload = {
      recipients,
      task: {
        id: task.id,
        title: task.title,
        status: task.status,
        description: task.description,
        assigneeIds: recipients,
      },
      comment: {
        authorId: data.authorId,
        content: data.content
      },
      action: "COMMENT",
    }
    this.notificationClient.emit("task.comment", payload)
    return createdComment;
  }
}

import { ActionType, AssignTaskPayload, CreateCommentPayload, CreateTaskPayload, PaginationQueryPayload, PaginationResultDto, TaskNotificationPayload, UpdateTaskPayload } from '@challenge/types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { AuditChanges, TaskHistory } from 'src/history/entity/task-history.entity';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @InjectRepository(TaskHistory) private historyRepository: Repository<TaskHistory>,
    @Inject("NOTIFICATION_SERVICE") private readonly notificationClient: ClientProxy,
    private readonly commentService: CommentService
  ) { }

  async create(dto: CreateTaskPayload): Promise<Task> {
    return await this.taskRepository.save(dto)
  }

  async update(data: UpdateTaskPayload): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } });
    if (!task) throw new NotFoundException("Task não encontrada");

    const changes: AuditChanges = { old: {}, new: {} };
    let hasChanges = false;

    const { taskId, authorId, ...fieldsToUpdate } = data;

    for (const key of Object.keys(fieldsToUpdate)) {
      const newValue = fieldsToUpdate[key];
      const oldValue = task[key];

      if (newValue !== undefined && newValue !== oldValue) {
        changes.old[key] = oldValue;
        changes.new[key] = newValue;
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.historyRepository.save({
        taskId: task.id,
        action: ActionType.UPDATE,
        changes: changes,
        changedBy: authorId
      });
    }

    Object.assign(task, fieldsToUpdate);
    const updatedTask = await this.taskRepository.save(task);

    const payload: TaskNotificationPayload = {
      recipients: updatedTask.assignees || [],
      task: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        description: updatedTask.description,
        assigneeIds: updatedTask.assignees || []
      },
      action: (data.status && data.status !== task.status) ? ActionType.STATUS_CHANGE : ActionType.UPDATE
    };

    this.notificationClient.emit("task.updated", payload);

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

    if (!task.assignees) task.assignees = [];

    if (!task.assignees.includes(data.assigneeId)) {
      const oldAssignees = [...task.assignees];

      task.assignees.push(data.assigneeId);
      const savedTask = await this.taskRepository.save(task);

      await this.historyRepository.save({
        taskId: task.id,
        action: ActionType.ASSIGNED,
        changes: {
          old: { assignees: oldAssignees },
          new: { assignees: task.assignees }
        },
        changedBy: data.assignerId
      });

      const payload: TaskNotificationPayload = {
        recipients: [data.assigneeId],
        task: {
          id: savedTask.id,
          assigneeIds: savedTask.assignees,
          status: savedTask.status,
          title: savedTask.title,
          description: savedTask.description,
        },
        action: ActionType.ASSIGNED
      };

      this.notificationClient.emit("task.assigned", payload);
    }
    return task;
  }

  async comment(data: CreateCommentPayload): Promise<Comment> {
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } })
    if (!task) throw new NotFoundException();

    const createdComment = await this.commentService.create(data);

    let recipients: string[] = [task.creatorId]

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
      action: ActionType.COMMENT,
    }
    this.notificationClient.emit("task.comment", payload)
    return createdComment;
  }
}

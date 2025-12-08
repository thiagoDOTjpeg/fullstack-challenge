import { CreateTaskDto, PaginationQueryDto, PaginationResultDto } from '@challenge/types';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentService } from 'src/comment/comment.service';
import { Comment } from 'src/comment/entity/comment.entity';
import { Repository } from 'typeorm';
import { Task } from './entity/task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    private readonly commentService: CommentService
  ) { }

  async create(dto: CreateTaskDto & { creator_id: string }): Promise<Task> {
    return await this.taskRepository.save(dto)
  }

  async getAll(pagination: PaginationQueryDto): Promise<PaginationResultDto<Task[]>> {
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

  async getById(task_id: string) {
    const query = this.taskRepository.createQueryBuilder("task")
      .leftJoinAndSelect("task.comments", "comments")
      .andWhere("task.id = :id", { id: task_id })
    const task = await query.getOne();
    if (!task) throw new NotFoundException();
    return task;
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

  async comment(data: { task_id: string, author_id: string, content: string }): Promise<Comment> {
    const task = await this.taskRepository.findOne({ where: { id: data.task_id } })
    console.log(task);

    if (!task) throw new NotFoundException();

    return await this.commentService.create(data);
  }
}

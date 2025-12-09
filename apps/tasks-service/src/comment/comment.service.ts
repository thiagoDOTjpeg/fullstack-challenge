import { Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "src/task/entity/task.entity";
import { Repository } from "typeorm";
import { Comment } from "./entity/comment.entity";

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepository: Repository<Comment>,
    @InjectRepository(Task) private taskRepository: Repository<Task>,
    @Inject("NOTIFICATION_SERVICE") private readonly notificationClient: ClientProxy
  ) { }

  async create(data: { task_id: string, author_id: string, content: string }): Promise<Comment> {
    const savedComment = await this.commentRepository.save(data);
    const task = await this.taskRepository.findOne({ where: { id: data.task_id } })

    if (task) {
      const recipients = new Set<string>();

      recipients.add(task.creator_id);

      if (task.assignees) {
        task.assignees.forEach(id => recipients.add(id));
      }

      recipients.delete(data.author_id);

      if (recipients.size > 0) {
        this.notificationClient.emit("comment.created", {
          commentId: savedComment.id,
          taskId: data.task_id,
          taskTitle: task.title,
          content: data.content,
          authorId: data.author_id,
          recipients: Array.from(recipients)
        });
      }
    }
    return savedComment;
  }
}

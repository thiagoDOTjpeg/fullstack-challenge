import { CreateCommentPayload } from "@challenge/types";
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

  async create(data: CreateCommentPayload): Promise<Comment> {
    const savedComment = await this.commentRepository.save(data);
    const task = await this.taskRepository.findOne({ where: { id: data.taskId } })

    if (task) {
      const recipients = new Set<string>();

      recipients.add(task.creatorId);

      if (task.assignees) {
        task.assignees.forEach(id => recipients.add(id));
      }

      recipients.delete(data.authorId);

      if (recipients.size > 0) {
        this.notificationClient.emit("comment.created", {
          commentId: savedComment.id,
          taskId: data.taskId,
          taskTitle: task.title,
          content: data.content,
          authorId: data.authorId,
          recipients: Array.from(recipients)
        });
      }
    }
    return savedComment;
  }
}

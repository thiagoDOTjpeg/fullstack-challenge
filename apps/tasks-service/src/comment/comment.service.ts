import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entity/comment.entity';

@Injectable()
export class CommentService {
  constructor(@InjectRepository(Comment) private commentRepository: Repository<Comment>) { }

  async create(data: { task_id: string, author_id: string, content: string }): Promise<Comment> {
    // TODO implementar emit de evento de comentário criado
    return await this.commentRepository.save(data);
  }
}

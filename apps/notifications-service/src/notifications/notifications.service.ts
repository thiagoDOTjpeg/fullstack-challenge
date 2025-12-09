import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    private readonly wsGateway: NotificationsGateway,
  ) { }

  async notifyTaskAssigned(data: { userId: string, taskTitle: string }) {
    const title = 'Nova Atribuição';
    const content = `Você foi atribuído à tarefa ${data.taskTitle}`;

    const notification = this.notificationRepository.create({ user_id: data.userId, title, content });
    await this.notificationRepository.save(notification);

    this.wsGateway.notifyUser(data.userId, notification);
  }

  async notifyNewComment(data: { recipients: string[]; taskId: string; content: string, taskTitle: string }) {
    const title = 'Novo Comentário';
    const content = `Comentário na tarefa ${data.taskTitle}: "${data.content.substring(0, 30)}..."`;

    for (const userId of data.recipients) {
      const notification = this.notificationRepository.create({ user_id: userId, title, content });
      await this.notificationRepository.save(notification);
      this.wsGateway.notifyUser(userId, notification);
    }
  }
}
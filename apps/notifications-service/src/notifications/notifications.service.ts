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
    const notification = await this.saveNotification(data.userId, "Nova Atribuição", `Você foi atribuído à tarefa ${data.taskTitle}`)
    await this.notificationRepository.save(notification);

    this.wsGateway.notifyUser(data.userId, "task.updated", notification);
  }

  async notifyTaskCreated(data: { userId: string; taskTitle: string }) {
    const notification = await this.saveNotification(data.userId, 'Nova Tarefa', `Tarefa ${data.taskTitle} criada.`);

    this.wsGateway.notifyUser(data.userId, 'task:created', notification);
  }

  async notifyNewComment(data: { recipients: string[]; content: string }) {
    if (data.recipients) {
      for (const userId of data.recipients) {
        const notification = await this.saveNotification(userId, 'Novo Comentário', `${data.content.slice(0, 30)}...`);

        this.wsGateway.notifyUser(userId, 'comment:new', notification);
      }
    }
  }

  private async saveNotification(userId: string, title: string, content: string) {
    return this.notificationRepository.save(this.notificationRepository.create({ user_id: userId, title, content }));
  }
}
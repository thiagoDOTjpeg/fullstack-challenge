import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly service: NotificationsService) { }

  @EventPattern('task.assigned')
  async handleTaskAssigned(@Payload() data: any) {
    await this.service.notifyTaskAssigned(data);
  }

  @EventPattern('comment.created')
  async handleNewComment(@Payload() data: any) {
    await this.service.notifyNewComment(data);
  }
}
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksController } from './tasks.controller';

@Module({
  imports: [ClientsModule.register([
    {
      name: "TASKS_SERVICE",
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://admin:admin@localhost:5672"],
        queue: "tasks_queue",
        queueOptions: {
          durable: false
        }
      }
    }
  ])],
  controllers: [TasksController]
})
export class TasksModule { }

import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UserController } from './user.controller';

@Module({
  imports: [ClientsModule.register([
    {
      name: "USER_SERVICE",
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://admin:admin@localhost:5672"],
        queue: "user_queue",
        queueOptions: {
          durable: false
        }
      }
    },
  ])],
  controllers: [UserController]
})
export class UserModule { }

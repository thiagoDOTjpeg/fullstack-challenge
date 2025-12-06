import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthController } from './auth.controller';

@Module({
  imports: [ClientsModule.register([
    {
      name: "AUTH_SERVICE",
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://admin:admin@localhost:5672"],
        queue: "auth_queue",
        queueOptions: {
          durable: false
        }
      }
    }
  ])],
  controllers: [AuthController],
})
export class AuthModule { }

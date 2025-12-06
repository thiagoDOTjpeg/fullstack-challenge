import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

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
  ]),
    PassportModule],
  controllers: [AuthController],
  providers: [JwtStrategy],
  exports: [PassportModule, JwtStrategy]
})
export class AuthModule { }

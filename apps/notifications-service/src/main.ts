import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URI || 'amqp://admin:admin@localhost:5672'],
      queue: 'notifications_queue',
      queueOptions: { durable: false },
    },
  });

  await app.startAllMicroservices();

  const httpPort = Number(process.env.HTTP_PORT) || 3013;
  await app.listen(httpPort, '0.0.0.0');

  const logger = app.get(Logger);
  logger.log(`Notifications Service Health Check listening on HTTP port ${httpPort}`);
}
bootstrap();
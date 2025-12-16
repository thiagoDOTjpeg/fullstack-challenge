import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: Number(process.env.TCP_PORT) || 3002,
    },
  });

  await app.startAllMicroservices();

  const httpPort = Number(process.env.HTTP_PORT) || 3012;
  await app.listen(httpPort, "0.0.0.0");

  const logger = app.get(Logger);
  logger.log(`Auth Service TCP listening on port ${process.env.TCP_PORT || 3002}`);
  logger.log(`Auth Service Health Check listening on HTTP port ${httpPort}`);
}

bootstrap();
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/datasource';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), NotificationsModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

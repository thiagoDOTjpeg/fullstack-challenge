import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'db/datasource';
import { CommentModule } from './comment/comment.module';
import { TaskModule } from './task/task.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    TaskModule,
    CommentModule,
    HistoryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }

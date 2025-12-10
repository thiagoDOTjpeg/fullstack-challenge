import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [TasksModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

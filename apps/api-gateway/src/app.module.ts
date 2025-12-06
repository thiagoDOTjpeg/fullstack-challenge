import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [TasksModule, AuthModule, UserModule],
  controllers: [],
  providers: [],
})
export class AppModule { }

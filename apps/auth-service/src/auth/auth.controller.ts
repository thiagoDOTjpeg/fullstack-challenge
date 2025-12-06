import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { LoginAuthDto } from '@challenge/types';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @MessagePattern("auth.login")
  login(@Payload() dto: LoginAuthDto) {
    return this.authService.login(dto);
  }
}

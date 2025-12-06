import { LoginAuthDto } from '@challenge/types';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags("auth")
@Controller('auth')
export class AuthController {
  constructor(@Inject("AUTH_SERVICE") private readonly authClient: ClientProxy) { }

  @Post("/login")
  @ApiOperation({ summary: "Login do usuário" })
  login(@Body() dto: LoginAuthDto) {
    return this.authClient.send("auth.login", dto);
  }
}

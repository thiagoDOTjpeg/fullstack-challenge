import { LoginAuthDto, RegisterAuthDto } from '@challenge/types';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';

@ApiTags("auth")
@Controller('/api/auth')
export class AuthController {
  constructor(
    @Inject("AUTH_SERVICE") private readonly authClient: ClientProxy
  ) { }

  @Post("/login")
  @ApiOperation({ summary: "Login do usuário" })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso. Retorna tokens (access_token, refresh_token,).' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas (Email ou senha incorretos).' })
  @ApiBody({ type: LoginAuthDto })
  login(@Body() dto: LoginAuthDto) {
    return this.authClient.send("auth.login", dto);
  }

  @Post("/register")
  @ApiOperation({ summary: "Registrar novo usuário" })
  @ApiResponse({ status: 201, description: 'Usuário registrado com sucesso. Retorna tokens (access_token, refresh_token, user).' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos ou usuário já existe.' })
  @ApiResponse({ status: 409, description: 'Email já cadastrado.' })
  @ApiBody({ type: RegisterAuthDto })
  register(@Body() dto: RegisterAuthDto) {
    return this.authClient.send("auth.register", dto);
  }
}
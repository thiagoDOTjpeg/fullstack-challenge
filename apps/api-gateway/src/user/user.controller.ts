import {
  PaginationQueryDto,
  RegisterAuthDto,
  UpdateUserDto
} from '@challenge/types';
import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@Controller('/api/users')
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Criar usuário (Proxy para Auth Service)' })
  create(@Body() dto: RegisterAuthDto) {
    return this.userClient.send('users.create', dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários' })
  getAll(@Query() pagination: PaginationQueryDto) {
    return this.userClient.send('users.find_all', pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.userClient.send('users.find_one', id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto
  ) {
    return this.userClient.send('users.update', { id, dto });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deletar usuário' })
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.userClient.send('users.delete', id);
  }
}
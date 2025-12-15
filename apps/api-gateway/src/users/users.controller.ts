import { ResponseUserDto } from '@challenge/types';
import { Controller, Get, Inject, Query, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@Controller('/api/users')
export class UsersController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) { }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Batch buscar usuários por IDs' })
  @ApiQuery({ name: 'ids', required: true, description: 'Lista de IDs separada por vírgula' })
  @ApiResponse({ status: 200, description: 'Usuários retornados.' })
  async getManyByIds(@Query('ids') idsParam: string): Promise<ResponseUserDto[]> {
    const ids = (idsParam ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return this.authClient.send('users.getManyByIds', { ids }).toPromise();
  }
}

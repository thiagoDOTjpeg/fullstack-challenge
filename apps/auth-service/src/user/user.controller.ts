import {
  PaginationQueryDto,
  RegisterAuthDto,
  UpdateUserDto
} from '@challenge/types';
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  @MessagePattern('users.create')
  create(@Payload() dto: RegisterAuthDto) {
    return this.userService.create(dto);
  }

  @MessagePattern('users.find_all')
  getAll(@Payload() pagination: PaginationQueryDto) {
    return this.userService.getAll(pagination);
  }

  @MessagePattern('users.find_one')
  getById(@Payload() id: string) {
    return this.userService.getById(id);
  }

  @MessagePattern('users.update')
  update(@Payload() payload: { id: string; dto: UpdateUserDto }) {
    return this.userService.update(payload.id, payload.dto);
  }

  @MessagePattern('users.delete')
  delete(@Payload() id: string) {
    return this.userService.delete(id);
  }
}
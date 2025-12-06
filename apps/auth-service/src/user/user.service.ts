import { PaginationQueryDto, PaginationResultDto, RegisterAuthDto, UpdateUserDto } from '@challenge/types';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from "bcryptjs";
import { Repository } from 'typeorm';
import { User } from './entity/user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
  }

  async getByEmail(email: string): Promise<User> {
    const user: User | null = await this.userRepository.findOne({ where: { email: email } });
    if (!user) throw new NotFoundException();
    return user;
  }

  async getById(userId: string): Promise<User> {
    const user: User | null = await this.userRepository.findOne({ where: { id: userId } })
    if (!user) throw new NotFoundException();
    return user;
  }
  async getAll(pagination: PaginationQueryDto): Promise<PaginationResultDto<User[]>> {
    const { limit = 10, page = 1 } = pagination;

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await this.userRepository.findAndCount({
      skip,
      take: limit,
    });

    return {
      items: users,
      data: {
        totalItems: totalUsers,
        itemCount: users.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(totalUsers / limit),
        currentPage: page,
      },
    };
  }

  async create(dto: RegisterAuthDto): Promise<User> {
    const exists = await this.userRepository.findOne({ where: [{ email: dto.email }, { username: dto.username }] })
    if (exists) throw new ConflictException("Email/Usuário já utilizados");
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const savedUser = await this.userRepository.save({ ...dto, password: hashedPassword });

    //@ts-ignore
    delete savedUser.password;
    return savedUser;
  }

  async update(userId: string, dto: UpdateUserDto) {
    let hashedPassword: string | undefined;
    if (dto.password != null && dto.password != undefined) {
      hashedPassword = await bcrypt.hash(dto.password, 10);
    }
    const updatedUser = await this.userRepository.createQueryBuilder()
      .update(User)
      .set({ ...dto, ...(hashedPassword ? { password: hashedPassword } : {}) })
      .where("id = :id", { id: userId })
      .returning("*")
      .execute();
    //@ts-ignore
    delete updatedUser.raw[0].password
    return updatedUser.raw[0]
  }
  async delete(userId: string): Promise<void> {
    await this.userRepository.delete(userId);
  }
}

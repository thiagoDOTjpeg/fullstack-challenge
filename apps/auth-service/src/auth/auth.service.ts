import { LoginAuthPayload, RefreshAuthPayload, RegisterAuthPayload, ResponseAuthDto } from '@challenge/types';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcryptjs";
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(@Inject() private userService: UserService, @Inject() private jwtService: JwtService) { }

  async login(dto: LoginAuthPayload): Promise<ResponseAuthDto> {
    const user = await this.userService.getByEmail(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException("Email/Senha incorretos ou inválidos");
    const accessToken: string = await this.generateAccessToken(user);
    const refreshToken: string = await this.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  }

  async register(dto: RegisterAuthPayload): Promise<ResponseAuthDto> {
    const user = await this.userService.create(dto)
    const accessToken: string = await this.generateAccessToken(user);
    const refreshToken: string = await this.generateRefreshToken(user);
    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  }

  async refresh(payload: RefreshAuthPayload) {

  }

  private async generateAccessToken(user: User) {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: "15m" })
  }
  private async generateRefreshToken(user: User) {
    const payload = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: "7d" })
  }
}

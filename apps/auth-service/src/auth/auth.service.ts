import { JwtTokenPayload, LoginAuthPayload, RefreshAuthPayload, RegisterAuthPayload, ResponseAuthDto } from '@challenge/types';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from "bcryptjs";
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject() private userService: UserService,
    @Inject() private jwtService: JwtService,
  ) { }

  async login(dto: LoginAuthPayload): Promise<ResponseAuthDto> {
    const user = await this.userService.getByEmail(dto.email);
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
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

    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user)
    ])

    await this.userService.update(user.id, { refreshToken });

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

  async refresh(payload: RefreshAuthPayload): Promise<ResponseAuthDto> {
    const decodedJwt = await this.jwtService.verifyAsync<JwtTokenPayload>(payload.refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });

    const user = await this.userService.getById(decodedJwt.sub);

    const isMatch = await bcrypt.compare(payload.refreshToken, user.refreshTokenHash);
    if (!isMatch) throw new UnauthorizedException("Refresh token inválido ou reutilizado");

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    await this.userService.update(user.id, { refreshToken: refreshToken });

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

  private async generateAccessToken(user: User) {
    const payload: Omit<JwtTokenPayload, "iat" | "exp"> = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: "15m" })
  }
  private async generateRefreshToken(user: User) {
    const payload: Omit<JwtTokenPayload, "iat" | "exp"> = { sub: user.id, username: user.username };
    return this.jwtService.sign(payload, { expiresIn: "7d" })
  }
}

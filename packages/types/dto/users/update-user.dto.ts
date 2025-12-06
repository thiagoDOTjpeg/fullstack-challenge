import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'thiago_dev_v2', description: 'Novo nome de usuário' })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({ example: 'novo_email@jungle.io', description: 'Novo e-mail' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '12345678', description: 'Nova senha (mínimo 6 caracteres)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
import { ResponseUserDto } from "dto/users/response-user.dto";

export class ResponseAuthDto {
  accessToken: string;
  refreshToken: string;
  user: ResponseUserDto
}
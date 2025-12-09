import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

jest.mock("bcryptjs")

describe("AuthService", () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUserService = {
    getByEmail: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("deve estar definido", () => {
    expect(authService).toBeDefined();
  });

  describe("login", () => {
    const loginDto = { email: "teste@jungle.com", password: "123" };

    const mockUser = {
      id: "uuid-123",
      email: "teste@jungle.com",
      password: "hash-da-senha",
      username: "thiago"
    };

    it("deve retornar tokens se a senha estiver correta", async () => {
      mockUserService.getByEmail.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue("token-jwt-falso");

      (bcrypt.compare as jest.Mock).mockResolvedValue(true)

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty("accessToken", "token-jwt-falso");
      expect(result).toHaveProperty("refreshToken", "token-jwt-falso");
      expect(mockUserService.getByEmail).toHaveBeenCalledWith(loginDto.email);
    });

    it("deve lançar UnauthorizedException se a senha estiver errada", async () => {
      mockUserService.getByEmail.mockResolvedValue(mockUser);

      (bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
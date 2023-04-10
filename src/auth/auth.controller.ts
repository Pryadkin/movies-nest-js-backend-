import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
  ValidationPipe
} from '@nestjs/common'
import {AuthService} from './auth.service';
import {AuthDto} from './dto/auth.dto';
import {RefreshTokenDto} from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) { }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('login/access-token')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.AuthService.getNewTokens(dto)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.AuthService.login(dto)
  }

  @UsePipes(new ValidationPipe())
  @Post('register')
  async register(@Body() dto: AuthDto) {
    const oldUser = await this.AuthService.findByEmail(dto.email)
    if (oldUser)
      throw new BadRequestException(
        'User with this email is already in the system'
      )

    return this.AuthService.register(dto)
  }
}

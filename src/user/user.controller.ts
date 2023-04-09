import {UserService} from './user.service';
import {Body, Controller, Post} from '@nestjs/common'

@Controller('auth')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('register')
  async register(@Body() dto: any) {
    return this.UserService
  }
}

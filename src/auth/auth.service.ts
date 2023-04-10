import {Injectable, UnauthorizedException} from '@nestjs/common'
import {ModelType} from '@typegoose/typegoose/lib/types';
import {InjectModel} from 'nestjs-typegoose';
import {UserModel} from 'src/user/user.model';
import {AuthDto} from './dto/auth.dto';
import {hash, genSalt, compare} from 'bcryptjs'
import {JwtService} from '@nestjs/jwt'
import {RefreshTokenDto} from './dto/refreshToken.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    private readonly jwtService: JwtService,
  ) { }

  async getNewTokens({refreshToken}: RefreshTokenDto) {
    if (!refreshToken) throw new UnauthorizedException('Please sign in!')

    // result - { _id: '643316933ee86fbfdde577eb', iat: 1681069745, exp: 1682365745 }
    const result = await this.jwtService.verifyAsync(refreshToken)

    if (!result) throw new UnauthorizedException('Invalid token or expired!')

    const user = await this.UserModel.findById(result._id)

    const tokens = await this.issueTokenPair(String(user._id))

    return {
      user: this.returnUserFields(user),
      ...tokens,
    }
  }

  async login(dto: AuthDto) {
    const user = await this.validationUser(dto)

    const tokens = await this.issueTokenPair(String(user._id))

    return {
      user: this.returnUserFields(user),
      ...tokens
    }
  }

  async register({email, password}: AuthDto) {
    const salt = await genSalt(10)
    const newUser = new this.UserModel({
      email,
      password: await hash(password, salt),
    })
    const user = await newUser.save()

    const tokens = await this.issueTokenPair(String(user._id))

    return {
      user: this.returnUserFields(user),
      ...tokens,
    }
  }

  async findByEmail(email: string) {
    return this.UserModel.findOne({email}).exec()
  }

  async validationUser(dto: AuthDto): Promise<UserModel> {
    const user = await this.UserModel.findOne({email: dto.email})
    if (!user) throw new UnauthorizedException('User not found')

    const isValidPassword = await compare(dto.password, user.password)
    if (!isValidPassword) throw new UnauthorizedException('Invalid password')

    return user
  }

  async issueTokenPair(userId: string) {
    const data = {_id: userId}

    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d'
    })

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h'
    })

    return {refreshToken, accessToken}
  }

  returnUserFields(user: UserModel) {
    return {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin
    }
  }
}
import {Module} from '@nestjs/common'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypegooseModule} from 'nestjs-typegoose'
import {AuthController} from './auth.controller'
import {UserModel} from 'src/user/user.model'
import {AuthService} from './auth.service'
import {JwtModule} from '@nestjs/jwt'
import {getJWTConfig} from 'src/config/jwt.config'
import {JwtStrategy} from './strategy/jwt.strategy'

@Module({
    imports: [
        ConfigModule,
        TypegooseModule.forFeature([
            {
                typegooseClass: UserModel,
                schemaOptions: {
                    collection: 'User'
                }
            }
        ]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getJWTConfig
        })
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}

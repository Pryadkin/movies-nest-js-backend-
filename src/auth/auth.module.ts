import {Module} from '@nestjs/common'
import {ConfigModule} from '@nestjs/config'
import {TypegooseModule} from 'nestjs-typegoose'
import {AuthController} from './auth.controller'
import {UserModel} from 'src/user/user.model'
import {AuthService} from './auth.service'

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
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}

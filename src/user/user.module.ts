import {Module} from '@nestjs/common';
import {UserService} from './user.service';
import {UserController} from './user.controller';
import {TypegooseModule} from 'nestjs-typegoose';
import {ConfigModule} from '@nestjs/config';
import {UserModel} from './user.model';

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
    providers: [UserService],
    controllers: [UserController]
})
export class UserModule {}
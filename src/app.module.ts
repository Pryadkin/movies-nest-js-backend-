import {Module} from '@nestjs/common'
import {AppController} from './app.controller'
import {AppService} from './app.service'
import {ConfigModule, ConfigService} from '@nestjs/config'
import {TypegooseModule} from 'nestjs-typegoose'
import {getMongoDbConfig} from './config/mongo.config'

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypegooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getMongoDbConfig,
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

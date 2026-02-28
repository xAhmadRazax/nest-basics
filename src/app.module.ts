import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DummyServiceService } from './dummy-service/dummy-service.service';
import { MessageFormatterService } from './message-formatter/message-formatter.service';
import { LoggerService } from './logger/logger.service';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './config/app.config';

@Module({
  imports: [ConfigModule.forRoot({ load: [appConfig] }), TasksModule],
  controllers: [AppController],

  providers: [
    AppService,
    DummyServiceService,
    MessageFormatterService,
    LoggerService,
  ],
})
export class AppModule {}

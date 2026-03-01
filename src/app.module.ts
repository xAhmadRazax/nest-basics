import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DummyServiceService } from './dummy-service/dummy-service.service';
import { MessageFormatterService } from './message-formatter/message-formatter.service';
import { LoggerService } from './logger/logger.service';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appConfig } from './config/app.config';
import { appConfigSchema } from './config/config.types';
import { typeOrmConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeConfigService } from './config/typed-config.service';
import { Task } from './tasks/entities/task.entity';
import { User } from './users/user.entity';
import { TaskLabel } from './tasks/entities/task-label.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, typeOrmConfig],
      validationSchema: appConfigSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: TypeConfigService) => ({
        ...(await configService.get('database')),
        entities: [Task, User, TaskLabel],
      }),
    }),
    TasksModule,
  ],
  controllers: [AppController],

  providers: [
    AppService,
    DummyServiceService,
    MessageFormatterService,
    LoggerService,
    { provide: TypeConfigService, useExisting: ConfigService },
  ],
})
export class AppModule {}

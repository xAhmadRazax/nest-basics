import { Injectable } from '@nestjs/common';
import { DummyServiceService } from './dummy-service/dummy-service.service';
import { LoggerService } from './logger/logger.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {}

  getHello(): string {
    const prefix = this.configService.get<string>('app.messagePrefix');

    return this.logger.log(`${prefix} hello world`);
  }
}

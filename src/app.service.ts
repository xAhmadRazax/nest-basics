import { Injectable } from '@nestjs/common';
import { LoggerService } from './logger/logger.service';

import { AppConfig } from './config/app.config';
import { TypeConfigService } from './config/typed-config.service';

@Injectable()
export class AppService {
  constructor(
    private readonly logger: LoggerService,
    private readonly configService: TypeConfigService,
  ) {}

  getHello(): string {
    const prefix = this.configService.get<AppConfig>('app')?.messagePrefix;

    return this.logger.log(`${prefix} hello world`);
  }
}

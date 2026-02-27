import { Injectable } from '@nestjs/common';
import { DummyServiceService } from './dummy-service/dummy-service.service';
import { LoggerService } from './logger/logger.service';

@Injectable()
export class AppService {
  constructor(
    private readonly dummyService: DummyServiceService,
    private readonly logger: LoggerService,
  ) {}

  getHello(): string {
    // return `Hello World! ${this.dummyService.work()}`;

    this.logger.log();

    return '';
  }
}

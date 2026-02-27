import { Injectable } from '@nestjs/common';

@Injectable()
export class DummyServiceService {
  work(): string {
    return `work done`;
  }
}

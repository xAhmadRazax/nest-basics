import { Test, TestingModule } from '@nestjs/testing';
import { DummyServiceService } from './dummy-service.service';

describe('DummyServiceService', () => {
  let service: DummyServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DummyServiceService],
    }).compile();

    service = module.get<DummyServiceService>(DummyServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

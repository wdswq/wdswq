import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return health status', () => {
    const health = service.check();
    
    expect(health).toHaveProperty('status', 'ok');
    expect(health).toHaveProperty('timestamp');
    expect(health).toHaveProperty('uptime');
    expect(health).toHaveProperty('environment');
    expect(health).toHaveProperty('version');
    
    expect(typeof health.timestamp).toBe('string');
    expect(typeof health.uptime).toBe('number');
    expect(typeof health.environment).toBe('string');
    expect(typeof health.version).toBe('string');
  });
});
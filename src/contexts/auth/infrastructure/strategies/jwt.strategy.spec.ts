import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user data from payload', () => {
      const payload = {
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        isEmailVerified: true,
        exp: 1234567890,
        iat: 1234567890,
      };

      const result = strategy.validate(payload);

      expect(result).toEqual({
        sub: '123',
        email: 'test@example.com',
        roles: ['user'],
        isEmailVerified: true,
      });
    });
  });
});

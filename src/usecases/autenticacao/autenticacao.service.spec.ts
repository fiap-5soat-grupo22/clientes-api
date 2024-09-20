import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoService } from './autenticacao.service';
import { CacheRepository } from '../../infrastructure/repositories/cache/cache.repository';
import { AutenticacaoRepository } from '../../infrastructure/repositories/autenticacao/autenticacao.repository';
import { ClienteRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { IdentityService } from '../../infrastructure/services/identity/identity.service';
import { addHours } from 'date-fns';

describe('AutenticacaoService', () => {
  let service: AutenticacaoService;
  let identityService: IdentityService;
  let autenticacaoRepository: AutenticacaoRepository;
  let clientesRepository: ClienteRepository;
  let cacheRepository: CacheRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoService,
        {
          provide: IdentityService,
          useValue: {
            signInWithEmailAndPassword: jest.fn(),
          },
        },
        {
          provide: AutenticacaoRepository,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
          },
        },
        {
          provide: ClienteRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: CacheRepository,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AutenticacaoService>(AutenticacaoService);
    identityService = module.get<IdentityService>(IdentityService);
    autenticacaoRepository = module.get<AutenticacaoRepository>(
      AutenticacaoRepository,
    );
    clientesRepository = module.get<ClienteRepository>(ClienteRepository);
    cacheRepository = module.get<CacheRepository>(CacheRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('basic', () => {
    it('should return cached config if available', async () => {
      const headers = new Map([
        ['authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='],
      ]);
      const cachedConfig = {
        expires: addHours(new Date(), 1),
        httpOnly: true,
        maxAge: 3600,
        secure: false,
        access_token: 'test-token',
        cliente: {
          id: 'test-cliente-id',
          email: 'test@example.com',
        },
      };
      jest
        .spyOn(cacheRepository, 'get')
        .mockResolvedValue(JSON.stringify(cachedConfig));

      const result = await service.basic(headers);

      expect(result).toEqual(cachedConfig);
      expect(cacheRepository.get).toHaveBeenCalledWith(
        'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA==',
      );
      expect(identityService.signInWithEmailAndPassword).not.toHaveBeenCalled();
    });

    it('should authenticate user and create authentication record if not cached', async () => {
      const headers = new Map([
        ['authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='],
      ]);
      const token = 'test-token';
      const cliente = {
        id: 'test-cliente-id',
        email: 'test@example.com',
      };
      jest.spyOn(cacheRepository, 'get').mockResolvedValue(null);
      jest
        .spyOn(identityService, 'signInWithEmailAndPassword')
        .mockResolvedValue(token);
      jest.spyOn(clientesRepository, 'findByEmail').mockResolvedValue(cliente);

      const result = await service.basic(headers);

      expect(identityService.signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@example.com',
        'password',
      );
      expect(clientesRepository.findByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(cacheRepository.set).toHaveBeenCalledWith(
        'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA==',
        JSON.stringify(
          expect.objectContaining({
            access_token: token,
            cliente,
          }),
        ),
      );
      expect(autenticacaoRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          access_token: token,
          cliente,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          access_token: token,
          cliente,
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should call autenticacaoRepository.findAll with correct parameters', async () => {
      const skip = '0';
      const take = '10';
      const fields = 'id, email';
      const filters = '{"email": "test@example.com"}';

      await service.findAll(skip, take, fields, filters);

      expect(autenticacaoRepository.findAll).toHaveBeenCalledWith(
        skip,
        take,
        fields,
        filters,
      );
    });
  });

  describe('extractAuthorizationHeader', () => {
    it('should extract email and password from authorization header', () => {
      const headers = new Map([
        ['authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='],
      ]);

      const [email, password] = service.extractAuthorizationHeader(headers);

      expect(email).toBe('test@example.com');
      expect(password).toBe('password');
    });
  });

  describe('checkCache', () => {
    it('should return cached config if available', async () => {
      const headers = new Map([
        ['authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='],
      ]);
      const cachedConfig = {
        expires: addHours(new Date(), 1).toISOString(),
        httpOnly: true,
        maxAge: 3600,
        secure: false,
        access_token: 'test-token',
        cliente: {
          id: 'test-cliente-id',
          email: 'test@example.com',
        },
      };
      jest
        .spyOn(cacheRepository, 'get')
        .mockResolvedValue(JSON.stringify(cachedConfig));

      const result = await service.checkCache(headers);

      expect(result).toEqual(
        expect.objectContaining({
          access_token: 'test-token',
          cliente: {
            id: 'test-cliente-id',
            email: 'test@example.com',
          },
        }),
      );
    });

    it('should return null if no cached config', async () => {
      const headers = new Map([
        ['authorization', 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA=='],
      ]);
      jest.spyOn(cacheRepository, 'get').mockResolvedValue(null);

      const result = await service.checkCache(headers);

      expect(result).toBeNull();
    });
  });
});

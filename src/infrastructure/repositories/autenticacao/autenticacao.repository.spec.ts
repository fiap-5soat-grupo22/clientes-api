import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoRepository } from './autenticacao.repository';
import { Autenticacao } from '../../../domain/autenticacao.model';
import { DataSource, MongoRepository } from 'typeorm';
import { AutenticacaoEntity } from '../../entities/autenticacao.entity';
import { getDataSourceToken } from '@nestjs/typeorm';

describe('AutenticacaoRepository', () => {
  let service: AutenticacaoRepository;
  let dataSource: DataSource;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let repository: MongoRepository<AutenticacaoEntity>;

  const autenticacaoDomainMock: Autenticacao = {
    uid: 'test-uid',
    usuario: {
      uid: 'test-user-uid',
      ativo: true,
      centro_despesa: 'test-centro-despesa',
      departamento: 'test-departamento',
      email: 'test@example.com',
      nome: 'Test User',
      habilidades: [],
      perfis: [],
      identity: 'test-identity',
      matricula: 'test-matricula',
      tipo: 'test-tipo',
    } as unknown as Usuario,
    data: new Date(),
    access_token: 'test-access-token',
    headers: new Map(),
    validade: new Date(),
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'gestao_acesso',
    destroy: jest.fn(),
    getMongoRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue(autenticacaoDomainMock.uid),
      save: jest.fn().mockResolvedValue(autenticacaoDomainMock),
      findOne: jest.fn().mockResolvedValue(autenticacaoDomainMock),
      find: jest.fn().mockResolvedValue([autenticacaoDomainMock]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutenticacaoRepository,
        {
          provide: getDataSourceToken('gestao_acesso'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [AutenticacaoEntity],
            }),
        },
        {
          provide: DataSource,
          useFactory: mockDataSource,
        },
        {
          provide: CommonsService,
          useValue: {
            queryFieldsArray: jest.fn().mockReturnValue(['uid']),
            queryFieldsObject: jest
              .fn()
              .mockReturnValue({ email: 'test@example.com' }),
          },
        },
      ],
    }).compile();

    service = module.get<AutenticacaoRepository>(AutenticacaoRepository);
    dataSource = module.get<DataSource>(DataSource);
    repository = dataSource.getMongoRepository(AutenticacaoEntity);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new AutenticacaoEntity and return its uid', async () => {
      const result = await service.create(autenticacaoDomainMock);

      expect(result).toBe('test-uid');
    });
  });

  describe('toEntity', () => {
    it('should convert a Autenticacao domain to an AutenticacaoEntity', () => {
      const entity = service.toEntity(autenticacaoDomainMock);

      expect(entity).toHaveProperty('uid');
    });
  });
});

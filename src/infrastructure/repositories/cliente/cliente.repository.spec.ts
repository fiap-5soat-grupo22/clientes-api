import { Test, TestingModule } from '@nestjs/testing';
import { ClienteRepository } from './cliente.repository';
import { ClienteEntity } from '../../entities/cliente.entity';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { ClienteFactory } from '../../factories/medico.factory';

describe('ClienteRepository', () => {
  let service: ClienteRepository;

  const mockCliente: Cliente = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    tipo: TipoCliente.Colaborador,
    email: 'test@example.com',
    nome: 'Test User',
    matricula: '12345',
    departamento: 'Test Department',
    centro_despesa: 'test-0000182635',
    habilidades: ['ROLE_USER'],
    perfis: ['PERFIL_USER'],
    ativo: true,
  };

  const mockClienteEntity: ClienteEntity = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    tipo: TipoCliente.Colaborador,
    email: 'test@example.com',
    nome: 'Test User',
    matricula: '12345',
    departamento: 'Test Department',
    centro_despesa: 'test-0000182635',
    habilidades: ['ROLE_USER'],
    perfis: ['PERFIL_USER'],
    ativo: true,
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'gestao_acesso',
    destroy: jest.fn(),
    getMongoRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue(mockCliente.uid),
      save: jest.fn().mockResolvedValue(mockClienteEntity),
      findOne: jest.fn().mockResolvedValue(mockClienteEntity),
      find: jest.fn().mockResolvedValue([mockClienteEntity]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteRepository,
        ClienteFactory,
        {
          provide: getDataSourceToken('gestao_acesso'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [ClienteEntity],
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

    service = module.get<ClienteRepository>(ClienteRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const uid = await service.create(mockCliente);
      expect(uid).toBe(mockCliente.uid);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toEqual(mockCliente);
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      const users = await service.findAll(
        '0',
        '10',
        'uid',
        'email=test@example.com',
      );
      expect(users).toEqual([mockCliente]);
    });
  });

  describe('findOne', () => {
    it('should find a user by uid', async () => {
      const user = await service.findOne(mockCliente.uid, 'nome');
      expect(user).toEqual(mockCliente);
    });

    it('should find a user by uid without fields asked', async () => {
      const user = await service.findOne(mockCliente.uid, null);
      expect(user).toEqual(mockCliente);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const result = await service.update(mockCliente.uid, mockCliente);
      expect(result).toBe(true);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      expect(service.remove('teste')).rejects.toThrow(
        Error('Method not implemented.'),
      );
    });
  });
  describe('createWithPassword', () => {
    it('should create a user with password', async () => {
      await expect(async () =>
        service.createWithPassword(mockCliente, 'teste'),
      ).rejects.toThrow(Error('Method not implemented.'));
    });
  });
});

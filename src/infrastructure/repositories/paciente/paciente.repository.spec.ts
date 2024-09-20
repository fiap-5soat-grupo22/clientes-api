import { Test, TestingModule } from '@nestjs/testing';
import { pacienteRepository } from './medico.repository';
import { PacienteEntity } from '../../entities/cliente.entity';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { PacienteFactory } from '../../factories/medico.factory';

describe('PacienteRepository', () => {
  let service: PacienteRepository;

  const mockPaciente: Paciente = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    tipo: TipoPaciente.Colaborador,
    email: 'test@example.com',
    nome: 'Test User',
    matricula: '12345',
    departamento: 'Test Department',
    centro_despesa: 'test-0000182635',
    habilidades: ['ROLE_USER'],
    perfis: ['PERFIL_USER'],
    ativo: true,
  };

  const mockPacienteEntity: PacienteEntity = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    tipo: TipoPaciente.Colaborador,
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
      create: jest.fn().mockResolvedValue(mockPaciente.uid),
      save: jest.fn().mockResolvedValue(mockPacienteEntity),
      findOne: jest.fn().mockResolvedValue(mockPacienteEntity),
      find: jest.fn().mockResolvedValue([mockPacienteEntity]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacienteRepository,
        PacienteFactory,
        {
          provide: getDataSourceToken('gestao_acesso'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [PacienteEntity],
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

    service = module.get<PacienteRepository>(PacienteRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const uid = await service.create(mockPaciente);
      expect(uid).toBe(mockPaciente.uid);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toEqual(mockPaciente);
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
      expect(users).toEqual([mockPaciente]);
    });
  });

  describe('findOne', () => {
    it('should find a user by uid', async () => {
      const user = await service.findOne(mockPaciente.uid, 'nome');
      expect(user).toEqual(mockPaciente);
    });

    it('should find a user by uid without fields asked', async () => {
      const user = await service.findOne(mockPaciente.uid, null);
      expect(user).toEqual(mockPaciente);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const result = await service.update(mockPaciente.uid, mockPaciente);
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
        service.createWithPassword(mockPaciente, 'teste'),
      ).rejects.toThrow(Error('Method not implemented.'));
    });
  });
});

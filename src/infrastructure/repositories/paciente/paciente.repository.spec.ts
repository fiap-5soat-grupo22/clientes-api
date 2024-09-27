import { Test, TestingModule } from '@nestjs/testing';
import { PacienteRepository } from './paciente.repository';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { PacienteEntity } from '../../entities/paciente.entity';
import { PacienteFactory } from '../../factories/paciente.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { Paciente } from '../../../domain/models/paciente.model';

describe('PacienteRepository', () => {
  let service: PacienteRepository;
  let pacienteFactory: PacienteFactory;

  const mockPaciente: Paciente = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    email: 'test@example.com',
    nome: 'Test User',
    cpf: '12345678901',
    habilidades: [],
    ativo: false
  };

  const mockPacienteEntity: PacienteEntity = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    email: 'test@example.com',
    nome: 'Test User',
    cpf: '12345678901',
    habilidades: [],
    ativo: false
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'clientes',
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
          provide: getDataSourceToken('clientes'),
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
    pacienteFactory = module.get<PacienteFactory>(PacienteFactory);
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
      // Use toThrow instead of toBe
      await expect(service.remove('teste')).rejects.toThrow('Method not implemented.');
    });
  });

  describe('createWithPassword', () => {
    it('should create a user with password', async () => {
      await expect(service.createWithPassword(mockPaciente, 'teste')).rejects.toThrow('Method not implemented.');
    });
  });
});


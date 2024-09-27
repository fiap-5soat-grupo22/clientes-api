import { Test, TestingModule } from '@nestjs/testing';
import { MedicoRepository } from './medico.repository';
import { DataSource } from 'typeorm';
import { getDataSourceToken } from '@nestjs/typeorm';
import { MedicoEntity } from '../../entities/medico.entity';
import { MedicoFactory } from '../../factories/medico.factory';
import { CommonsService } from '../../services/commons/commons.service';
import { Medico } from '../../../domain/models/medico.model';

describe('MedicoRepository', () => {
  let service: MedicoRepository;
  let medicoFactory: MedicoFactory;

  const mockMedico: Medico = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    email: 'test@example.com',
    nome: 'Test User',
    cpf: '12345678901',
    habilidades: [],
    ativo: false,
    crm: ''
  };

  const mockMedicoEntity: MedicoEntity = {
    uid: '66974b15529af1d850a03f19',
    identity: 'test-provider-uid',
    email: 'test@example.com',
    nome: 'Test User',
    cpf: '12345678901',
    habilidades: [],
    ativo: false,
    crm: ''
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const mockDataSource = (_config: object): Partial<DataSource> => ({
    name: 'clientes',
    destroy: jest.fn(),
    getMongoRepository: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue(mockMedico.uid),
      save: jest.fn().mockResolvedValue(mockMedicoEntity),
      findOne: jest.fn().mockResolvedValue(mockMedicoEntity),
      find: jest.fn().mockResolvedValue([mockMedicoEntity]),
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        matchedCount: 1,
      }),
    }),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicoRepository,
        MedicoFactory,
        {
          provide: getDataSourceToken('clientes'),
          useFactory: () =>
            mockDataSource({
              type: 'mongodb',
              entities: [MedicoEntity],
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

    service = module.get<MedicoRepository>(MedicoRepository);
    medicoFactory = module.get<MedicoFactory>(MedicoFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const uid = await service.create(mockMedico);
      expect(uid).toBe(mockMedico.uid);
    });
  });

  describe('findByEmail', () => {
    it('should find a user by email', async () => {
      const user = await service.findByEmail('test@example.com');
      expect(user).toEqual(mockMedico);
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
      expect(users).toEqual([mockMedico]);
    });
  });

  describe('findOne', () => {
    it('should find a user by uid', async () => {
      const user = await service.findOne(mockMedico.uid, 'nome');
      expect(user).toEqual(mockMedico);
    });

    it('should find a user by uid without fields asked', async () => {
      const user = await service.findOne(mockMedico.uid, null);
      expect(user).toEqual(mockMedico);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const result = await service.update(mockMedico.uid, mockMedico);
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
      await expect(service.createWithPassword(mockMedico, 'teste')).rejects.toThrow('Method not implemented.');
    });
  });
});


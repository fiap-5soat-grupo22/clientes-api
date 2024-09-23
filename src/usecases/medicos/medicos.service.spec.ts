import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { Medico } from '../../domain/models/medico.model';
import { ClienteRepository } from '../../infrastructure/repositories/medico/medico.repository';

describe('MedicoService', () => {
  let service: MedicosService;
  let identityRepository: IdentityRepository;
  let clienteRepository: ClienteRepository;

  const mockMedico: Medico = {
    uid: 'test-uid',
    departamento: 'Test Department',
    email: 'test@example.com',
    matricula: '12345',
    nome: 'Test User',
    habilidades: ['ROLE_USER'],
    ativo: true,
    tipo: TipoUsuario.Medico,
    identity: 'test-provider-uid',
    centro_despesa: 'test-0000182635',
    perfis: ['PERFIL_USER'],
  };

  const mockCreateMedicoDto: CreateMedicoDto = {
    departamento: 'Test Department',
    email: 'test@example.com',
    matricula: '12345',
    nome: 'Test User',
    habilidades: ['ROLE_USER'],
    ativo: true,
    senha: 'testPassword',
    centro_despesa: 'test-0000182635',
    perfis: ['PERFIL'],
  };

  const mockUpdateMedicoDto: UpdateMedicoDto = {
    departamento: 'Test Department',
    email: 'test@example.com',
    matricula: '12345',
    nome: 'Test User',
    habilidades: ['ROLE_USER'],
    centro_despesa: 'test-0000182635',
    perfis: ['PERFIL'],
    ativo: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicosService,
        {
          provide: IdentityRepository,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(null),
            createWithPassword: jest
              .fn()
              .mockResolvedValue('test-provider-uid'),
            setCustomUserClaims: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ClienteRepository,
          useValue: {
            findByEmail: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockResolvedValue('test-uid'),
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(mockMedico),
            update: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<MedicosService>(MedicosService);
    identityRepository = module.get<IdentityRepository>(IdentityRepository);
    clienteRepository = module.get<ClienteRepository>(ClienteRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const dto = { ...mockCreateMedicoDto };

      delete dto.senha;

      const uid = await service.create(mockCreateMedicoDto);

      expect(uid).toBe('test-uid');
    });

    it('should throw an error if the user already exists', async () => {
      jest
        .spyOn(clienteRepository, 'findByEmail')
        .mockResolvedValue(mockMedico);
      await expect(service.create(mockCreateMedicoDto)).rejects.toThrow(
        BadRequestException,
      );
      jest.spyOn(clienteRepository, 'findByEmail').mockResolvedValue(null);
      jest
        .spyOn(identityRepository, 'findByEmail')
        .mockResolvedValue(mockMedico);
      await expect(service.create(mockCreateMedicoDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = await service.findAll('0', '10', '', '');
      expect(users).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a user by uid', async () => {
      const user = await service.findOne('test-uid', '');
      expect(user).toEqual(mockMedico);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const result = await service.update('test-uid', mockUpdateMedicoDto);
      expect(result).toEqual({ message: 'ok', statusCode: 200 });
    });

    it('should throw an error if the user is not found', async () => {
      jest.spyOn(clienteRepository, 'update').mockResolvedValue(false);
      await expect(
        service.update('test-uid', mockUpdateMedicoDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      await service.remove('test-uid');
    });

    it('should throw an error if the user is not found', async () => {
      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(null);
      await expect(service.remove('test-uid')).rejects.toThrow(
        BadRequestException,
      );
      jest.spyOn(clienteRepository, 'findOne').mockResolvedValue(mockMedico);
      jest.spyOn(clienteRepository, 'update').mockResolvedValue(false);
      await expect(service.remove('test-uid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

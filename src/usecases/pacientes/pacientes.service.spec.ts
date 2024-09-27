import { Test, TestingModule } from '@nestjs/testing';
import { PacientesService } from './pacientes.service';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Paciente } from '../../domain/models/paciente.model';
import { FastifyRequest } from 'fastify';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

describe('PacientesService', () => {
  let service: PacientesService;
  let identityRepository: IdentityRepository;
  let pacienteRepository: PacienteRepository;
  let autenticacaoService: AutenticacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PacientesService,
        {
          provide: IdentityRepository,
          useValue: {
            createWithPassword: jest.fn(),
            findByEmail: jest.fn(),
            setCustomUserClaims: jest.fn(),
            update: jest.fn(),
            signInWithEmailAndPassword: jest.fn(),
          },
        },
        {
          provide: PacienteRepository,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: AutenticacaoService,
          useValue: {
            extractCredentials: jest.fn(),
            cookiesConfig: jest.fn(),
            setCookiesResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PacientesService>(PacientesService);
    identityRepository = module.get<IdentityRepository>(IdentityRepository);
    pacienteRepository = module.get<PacienteRepository>(PacienteRepository);
    autenticacaoService = module.get<AutenticacaoService>(AutenticacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new paciente', async () => {
      const createPacienteDto: CreatePacienteDto = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password',
        cpf: '12345678901',
      };
      const identity = 'mockIdentityId';
      const pacienteUid = 'mockPacienteUid';

      (identityRepository.createWithPassword as jest.Mock).mockResolvedValue(
        identity,
      );
      (pacienteRepository.create as jest.Mock).mockResolvedValue(pacienteUid);

      const result = await service.create(createPacienteDto);

      expect(result).toBe(pacienteUid);

    });

    it('should throw BadRequestException if paciente already exists', async () => {
      const createPacienteDto: CreatePacienteDto = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password',
        cpf: '12345678901',
      };
      (pacienteRepository.findByEmail as jest.Mock).mockResolvedValue({
        uid: 'existingPacienteUid',
      });

      await expect(service.create(createPacienteDto)).rejects.toThrowError(
        BadRequestException,
      );
      expect(pacienteRepository.findByEmail).toHaveBeenCalledWith(
        createPacienteDto.email,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of pacientes', async () => {
      const pacientes: Paciente[] = [
        {
          uid: '1',
          nome: 'John Doe',
          email: 'john.doe@example.com',
          cpf: '12345678901',
          identity: 'identity1',
          habilidades: [],
          ativo: true,
        },
      ];
      (pacienteRepository.findAll as jest.Mock).mockResolvedValue(pacientes);

      const result = await service.findAll('0', '10', 'nome', 'ativo=true');

      expect(result).toBe(pacientes);
      expect(pacienteRepository.findAll).toHaveBeenCalledWith(
        '0',
        '10',
        'nome',
        'ativo=true',
      );
    });
  });

  describe('findOne', () => {
    it('should return a paciente by ID', async () => {
      const paciente: Paciente = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (pacienteRepository.findOne as jest.Mock).mockResolvedValue(paciente);

      const result = await service.findOne('1', 'nome,email');

      expect(result).toBe(paciente);
      expect(pacienteRepository.findOne).toHaveBeenCalledWith('1', 'nome,email');
    });
  });

  describe('update', () => {
    it('should update a paciente', async () => {
      const updatePacienteDto: UpdatePacienteDto = {
        nome: 'Jane Doe',
        email: 'jane.doe@example.com',
        cpf: '98765432101',
      };
      const paciente: Paciente = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (pacienteRepository.findOne as jest.Mock).mockResolvedValue(paciente);
      (pacienteRepository.update as jest.Mock).mockResolvedValue(true);

      const result = await service.update('1', updatePacienteDto);

      expect(result).toEqual({ message: 'ok', statusCode: 200 });
    });

    it('should throw NotFoundException if paciente not found', async () => {
      const updatePacienteDto: UpdatePacienteDto = {
        nome: 'Jane Doe',
        email: '',
        cpf: ''
      };
      (pacienteRepository.update as jest.Mock).mockResolvedValue(false);

      await expect(service.update('1', updatePacienteDto)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a paciente', async () => {
      const paciente: Paciente = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (pacienteRepository.findOne as jest.Mock).mockResolvedValue(paciente);
      (pacienteRepository.update as jest.Mock).mockResolvedValue(true);

      await service.remove('1');

      expect(pacienteRepository.update).toHaveBeenCalledWith('1', {
        ...paciente,
        ativo: false,
      });
      expect(identityRepository.update).toHaveBeenCalledWith('identity1', {
        ...paciente,
        ativo: false,
      });
    });

    it('should throw NotFoundException if paciente not found', async () => {
      (pacienteRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if paciente not updated', async () => {
      const paciente: Paciente = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (pacienteRepository.findOne as jest.Mock).mockResolvedValue(paciente);
      (pacienteRepository.update as jest.Mock).mockResolvedValue(false);

      await expect(service.remove('1')).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('authenticate', () => {
    it('should authenticate a paciente', async () => {
      const request = {
        headers: {
          authorization: 'Basic dGVzdEB0ZXN0ZS5jb206MTIzNDU2',
        },
      } as unknown as FastifyRequest;
      const response = {
        setCookie: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as any;
      const token = 'mockToken';
      const cliente: Paciente = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      const config = {
        token: 'mockToken',
        cliente: {
          uid: '1',
          nome: 'John Doe',
          email: 'john.doe@example.com',
          cpf: '12345678901',
          identity: 'identity1',
          habilidades: [],
          ativo: true,
        },
      };

      (autenticacaoService.extractCredentials as jest.Mock).mockReturnValue([
        'teste@teste.com',
        '123456',
      ]);
      (identityRepository.signInWithEmailAndPassword as jest.Mock).mockResolvedValue(
        token,
      );
      (pacienteRepository.findByEmail as jest.Mock).mockResolvedValue(cliente);
      (autenticacaoService.cookiesConfig as jest.Mock).mockReturnValue(config);

      const result = await service.authenticate(request, response);

      expect(result).toEqual(config);
      expect(autenticacaoService.extractCredentials).toHaveBeenCalledWith(
        'Basic dGVzdEB0ZXN0ZS5jb206MTIzNDU2',
      );
      expect(
        identityRepository.signInWithEmailAndPassword,
      ).toHaveBeenCalledWith('teste@teste.com', '123456');
      expect(pacienteRepository.findByEmail).toHaveBeenCalledWith(
        'teste@teste.com',
      );
      expect(autenticacaoService.cookiesConfig).toHaveBeenCalledWith(
        token,
        cliente,
      );
      expect(autenticacaoService.setCookiesResponse).toHaveBeenCalledWith(
        request,
        response,
        config,
      );
    });

    it('should throw UnauthorizedException if credentials are not provided', async () => {
      const request = {
        headers: {},
      } as unknown as FastifyRequest;
      const response = {
        setCookie: jest.fn(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as unknown as any;

      await expect(
        service.authenticate(request, response),
      ).rejects.toThrowError(UnauthorizedException);
    });
  });
});


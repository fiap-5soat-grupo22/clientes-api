import { Test, TestingModule } from '@nestjs/testing';
import { MedicosService } from './medicos.service';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Medico } from '../../domain/models/medico.model';
import { FastifyRequest } from 'fastify';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';
import { UpdateMedicoDto } from './dto/update-medico.dto';

describe('MedicosService', () => {
  let service: MedicosService;
  let identityRepository: IdentityRepository;
  let medicoRepository: MedicoRepository;
  let autenticacaoService: AutenticacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicosService,
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
          provide: MedicoRepository,
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

    service = module.get<MedicosService>(MedicosService);
    identityRepository = module.get<IdentityRepository>(IdentityRepository);
    medicoRepository = module.get<MedicoRepository>(MedicoRepository);
    autenticacaoService = module.get<AutenticacaoService>(AutenticacaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new medico', async () => {
      const createMedicoDto: CreateMedicoDto = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password',
        cpf: '12345678901',
        crm: '12345678901234',
      };
      const identity = 'mockIdentityId';
      const medicoUid = 'mockMedicoUid';

      (identityRepository.createWithPassword as jest.Mock).mockResolvedValue(
        identity,
      );
      (medicoRepository.create as jest.Mock).mockResolvedValue(medicoUid);

      const result = await service.create(createMedicoDto);

      expect(result).toBe(medicoUid);
    });

    it('should throw BadRequestException if medico already exists', async () => {
      const createMedicoDto: CreateMedicoDto = {
        nome: 'John Doe',
        email: 'john.doe@example.com',
        senha: 'password',
        cpf: '12345678901',
        crm: '12345678901234',
      };
      (medicoRepository.findByEmail as jest.Mock).mockResolvedValue({
        uid: 'existingMedicoUid',
      });

      await expect(service.create(createMedicoDto)).rejects.toThrowError(
        BadRequestException,
      );
      expect(medicoRepository.findByEmail).toHaveBeenCalledWith(
        createMedicoDto.email,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of medicos', async () => {
      const medicos: Medico[] = [
        {
          uid: '1',
          nome: 'John Doe',
          email: 'john.doe@example.com',
          cpf: '12345678901',
          crm: '12345678901234',
          identity: 'identity1',
          habilidades: [],
          ativo: true,
        },
      ];
      (medicoRepository.findAll as jest.Mock).mockResolvedValue(medicos);

      const result = await service.findAll('0', '10', 'nome', 'ativo=true');

      expect(result).toBe(medicos);
      expect(medicoRepository.findAll).toHaveBeenCalledWith(
        '0',
        '10',
        'nome',
        'ativo=true',
      );
    });
  });

  describe('findOne', () => {
    it('should return a medico by ID', async () => {
      const medico: Medico = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        crm: '12345678901234',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (medicoRepository.findOne as jest.Mock).mockResolvedValue(medico);

      const result = await service.findOne('1', 'nome,crm');

      expect(result).toBe(medico);
      expect(medicoRepository.findOne).toHaveBeenCalledWith('1', 'nome,crm');
    });
  });

  describe('update', () => {
    it('should update a medico', async () => {
      const updateMedicoDto: UpdateMedicoDto = {
        nome: 'Jane Doe',
        email: 'jane.doe@example.com',
        cpf: '98765432101',
        crm: '98765432101234',
      };
      const medico: Medico = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        crm: '12345678901234',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (medicoRepository.findOne as jest.Mock).mockResolvedValue(medico);
      (medicoRepository.update as jest.Mock).mockResolvedValue(true);

      const result = await service.update('1', updateMedicoDto);

      expect(result).toEqual({ message: 'ok', statusCode: 200 });
    });

    it('should throw NotFoundException if medico not found', async () => {
      const updateMedicoDto: UpdateMedicoDto = {
        nome: 'Jane Doe',
        email: '',
        cpf: '',
        crm: ''
      };
      (medicoRepository.update as jest.Mock).mockResolvedValue(false);

      await expect(service.update('1', updateMedicoDto)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a medico', async () => {
      const medico: Medico = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        crm: '12345678901234',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (medicoRepository.findOne as jest.Mock).mockResolvedValue(medico);
      (medicoRepository.update as jest.Mock).mockResolvedValue(true);

      await service.remove('1');

      expect(medicoRepository.update).toHaveBeenCalledWith('1', medico);
      expect(identityRepository.update).toHaveBeenCalledWith('identity1', {
        ...medico,
        ativo: false,
      });
    });

    it('should throw NotFoundException if medico not found', async () => {
      (medicoRepository.findOne as jest.Mock).mockResolvedValue(undefined);

      await expect(service.remove('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if medico not updated', async () => {
      const medico: Medico = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        crm: '12345678901234',
        identity: 'identity1',
        habilidades: [],
        ativo: true,
      };
      (medicoRepository.findOne as jest.Mock).mockResolvedValue(medico);
      (medicoRepository.update as jest.Mock).mockResolvedValue(false);

      await expect(service.remove('1')).rejects.toThrowError(
        BadRequestException,
      );
    });
  });

  describe('authenticate', () => {
    it('should authenticate a medico', async () => {
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
      const cliente: Medico = {
        uid: '1',
        nome: 'John Doe',
        email: 'john.doe@example.com',
        cpf: '12345678901',
        crm: '12345678901234',
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
          crm: '12345678901234',
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
      (medicoRepository.findByEmail as jest.Mock).mockResolvedValue(cliente);
      (autenticacaoService.cookiesConfig as jest.Mock).mockReturnValue(config);

      const result = await service.authenticate(request, response);

      expect(result).toEqual(config);
      expect(autenticacaoService.extractCredentials).toHaveBeenCalledWith(
        'Basic dGVzdEB0ZXN0ZS5jb206MTIzNDU2',
      );
      expect(
        identityRepository.signInWithEmailAndPassword,
      ).toHaveBeenCalledWith('teste@teste.com', '123456');
      expect(medicoRepository.findByEmail).toHaveBeenCalledWith(
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


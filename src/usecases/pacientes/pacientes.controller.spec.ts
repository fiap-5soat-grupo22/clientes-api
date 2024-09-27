import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import {
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { IdentityGuard } from '../../infrastructure/guards/identity/identity.guard';
import { Paciente } from '../../domain/models/paciente.model';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';

describe('PacientesController', () => {
  let controller: PacientesController;
  let service: PacientesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [
        {
          provide: PacientesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            authenticate: jest.fn(),
          },
        },
        {
          provide: IdentityGuard,
          useValue: {
            canActivate: jest.fn(() => true),
          },
        },
        IdentityRepository,
      ],
    }).compile();

    controller = module.get<PacientesController>(PacientesController);
    service = module.get<PacientesService>(PacientesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createV1', () => {
    it('should create a paciente', async () => {
      const createPacienteDto: CreatePacienteDto = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        cpf: '12345678901',
      };
      const createdPacienteUid = '1234567890';
      jest
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(createdPacienteUid));

      expect(await controller.createV1(createPacienteDto)).toBe(
        createdPacienteUid,
      );
      expect(service.create).toHaveBeenCalledWith(createPacienteDto);
    });
  });

  describe('accessTokenV1', () => {
    it('should authenticate a paciente', async () => {
      const request = {
        headers: {
          authorization: 'Basic dGVzdEB0ZXN0ZS5jb206MTIzNDU2',
        },
      } as unknown as FastifyRequest;
      const response = {
        setCookie: jest.fn(),
      } as unknown as FastifyReply;
      const token: object = {
        expires: '2024-09-21T12:00:00.000Z',
        httpOnly: true,
        maxAge: 3600,
        secure: false,
        access_token: '12345678',
        domain: 'teste',
      };
      jest
        .spyOn(service, 'authenticate')
        .mockImplementation(() => Promise.resolve(token));

      await controller.accessTokenV1(request, response);

      expect(service.authenticate).toHaveBeenCalledWith(request, response);
    });
  });

  describe('findAllV1', () => {
    it('should return an array of pacientes', async () => {
      const pacientes: Array<Paciente> = [
        {
          uid: '1234567890',
          nome: 'Teste',
          email: 'teste@teste.com',
          cpf: '12345678901',
          identity: '',
          habilidades: [],
          ativo: false
        },
      ];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(pacientes));

      expect(
        await controller.findAllV1('0', '10', 'nome', 'ativo=true'),
      ).toBe(pacientes);
      expect(service.findAll).toHaveBeenCalledWith('0', '10', 'nome', 'ativo=true');
    });
  });

  describe('findOneV1', () => {
    it('should return a paciente', async () => {
      const paciente: Paciente = {
        uid: '1234567890',
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '12345678901',
        identity: '',
        habilidades: [],
        ativo: false
      };
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(() => Promise.resolve(paciente));

      expect(await controller.findOneV1('1234567890', 'nome')).toBe(
        paciente,
      );
      expect(service.findOne).toHaveBeenCalledWith('1234567890', 'nome');
    });
  });

  describe('updateV1', () => {
    it('should update a paciente', async () => {
      const updatePacienteDto: UpdatePacienteDto = {
        nome: 'Teste',
        email: '',
        cpf: ''
      };
      jest
        .spyOn(service, 'update')
        .mockImplementation(() => Promise.resolve({ message: 'ok', statusCode: 200 }));

      expect(
        await controller.updateV1('1234567890', updatePacienteDto),
      ).toEqual({ message: 'ok', statusCode: 200 });
      expect(service.update).toHaveBeenCalledWith(
        '1234567890',
        updatePacienteDto,
      );
    });
  });

  describe('removeV1', () => {
    it('should remove a paciente', async () => {
      jest
        .spyOn(service, 'remove')
        .mockImplementation(() => Promise.resolve());

      await controller.removeV1('1234567890');

      expect(service.remove).toHaveBeenCalledWith('1234567890');
    });
  });
});


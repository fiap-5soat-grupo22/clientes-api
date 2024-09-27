import { Test, TestingModule } from '@nestjs/testing';
import { MedicosController } from './medicos.controller';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import {
  FastifyRequest,
  FastifyReply,
} from 'fastify';
import { IdentityGuard } from '../../infrastructure/guards/identity/identity.guard';
import { Medico } from '../../domain/models/medico.model';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';

describe('MedicosController', () => {
  let controller: MedicosController;
  let service: MedicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicosController],
      providers: [
        {
          provide: MedicosService,
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

    controller = module.get<MedicosController>(MedicosController);
    service = module.get<MedicosService>(MedicosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createV1', () => {
    it('should create a medico', async () => {
      const createMedicoDto: CreateMedicoDto = {
        nome: 'Teste',
        email: 'teste@teste.com',
        senha: '123456',
        cpf: '12345678901',
        crm: '123456789',
      };
      const createdMedicoUid = '1234567890';
      jest
        .spyOn(service, 'create')
        .mockImplementation(() => Promise.resolve(createdMedicoUid));

      expect(await controller.createV1(createMedicoDto)).toBe(
        createdMedicoUid,
      );
      expect(service.create).toHaveBeenCalledWith(createMedicoDto);
    });
  });

  describe('accessTokenV1', () => {
    it('should authenticate a medico', async () => {
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
    it('should return an array of medicos', async () => {
      const medicos: Array<Medico> = [
        {
          uid: '1234567890',
          nome: 'Teste',
          email: 'teste@teste.com',
          cpf: '12345678901',
          crm: '123456789',
          identity: '',
          habilidades: [],
          ativo: false
        },
      ];
      jest
        .spyOn(service, 'findAll')
        .mockImplementation(() => Promise.resolve(medicos));

      expect(
        await controller.findAllV1('0', '10', 'nome', 'ativo=true'),
      ).toBe(medicos);
      expect(service.findAll).toHaveBeenCalledWith('0', '10', 'nome', 'ativo=true');
    });
  });

  describe('findOneV1', () => {
    it('should return a medico', async () => {
      const medico: Medico = {
        uid: '1234567890',
        nome: 'Teste',
        email: 'teste@teste.com',
        cpf: '12345678901',
        crm: '123456789',
        identity: '',
        habilidades: [],
        ativo: false
      };
      jest
        .spyOn(service, 'findOne')
        .mockImplementation(() => Promise.resolve(medico));

      expect(await controller.findOneV1('1234567890', 'nome,crm')).toBe(
        medico,
      );
      expect(service.findOne).toHaveBeenCalledWith('1234567890', 'nome,crm');
    });
  });

  describe('updateV1', () => {
    it('should update a medico', async () => {
      const updateMedicoDto: UpdateMedicoDto = {
        nome: 'Teste',
        email: '',
        cpf: '',
        crm: ''
      };
      jest
        .spyOn(service, 'update')
        .mockImplementation(() => Promise.resolve({ message: 'ok', statusCode: 200 }));

      expect(
        await controller.updateV1('1234567890', updateMedicoDto),
      ).toEqual({ message: 'ok', statusCode: 200 });
      expect(service.update).toHaveBeenCalledWith(
        '1234567890',
        updateMedicoDto,
      );
    });
  });

  describe('removeV1', () => {
    it('should remove a medico', async () => {
      jest
        .spyOn(service, 'remove')
        .mockImplementation(() => Promise.resolve());

      await controller.removeV1('1234567890');

      expect(service.remove).toHaveBeenCalledWith('1234567890');
    });
  });
});


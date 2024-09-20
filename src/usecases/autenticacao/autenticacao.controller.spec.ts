import { Test, TestingModule } from '@nestjs/testing';
import { AutenticacaoController } from './autenticacao.controller';
import { AutenticacaoService } from './autenticacao.service';
import { Reply } from '@sortfy/nestjs-security';
import { FastifyRequest } from 'fastify';
import { ThrottlerModule } from '@nestjs/throttler';

describe('AutenticacaoController', () => {
  let controller: AutenticacaoController;
  let autenticacaoService: AutenticacaoService;
  let mockRequest: FastifyRequest;
  let mockResponse: Reply;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 100,
          },
        ]),
      ],
      controllers: [AutenticacaoController],
      providers: [
        {
          provide: AutenticacaoService,
          useFactory: () => ({
            basic: jest.fn().mockResolvedValue({
              expires: new Date(),
              httpOnly: true,
              maxAge: 3600,
              secure: false,
              access_token: 'test-token',
              usuario: {
                id: 'test-user-id',
                email: 'test@example.com',
              },
            }),
          }),
        },
      ],
    }).compile();

    controller = module.get<AutenticacaoController>(AutenticacaoController);
    autenticacaoService = module.get<AutenticacaoService>(AutenticacaoService);
    mockRequest = {
      hostname: 'localhost:3000',
      headers: {
        authorization: 'Basic dGVzdEBleGFtcGxlLmNvbTpwYXNzd29yZA==',
      },
    } as unknown as FastifyRequest;

    mockResponse = {
      setCookie: jest.fn(),
      send: jest.fn(),
    } as unknown as Reply;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('accessTokenV1', () => {
    it('should call autenticacaoService.basic with authorization header', async () => {
      await controller.accessTokenV1(mockRequest, mockResponse);
      expect(autenticacaoService.basic).toHaveBeenCalledWith(
        mockRequest.headers.authorization,
      );
    });

    it('should set Authorization cookie with access_token and config', async () => {
      await controller.accessTokenV1(mockRequest, mockResponse);
      expect(mockResponse.setCookie).toHaveBeenCalledWith(
        'Authorization',
        'test-token',
        expect.objectContaining({
          domain: 'localhost',
          expires: expect.any(Date),
          httpOnly: true,
          maxAge: 3600,
          secure: false,
        }),
      );
    });

    it('should set Authorized-User cookie with usuario and config', async () => {
      await controller.accessTokenV1(mockRequest, mockResponse);
      expect(mockResponse.setCookie).toHaveBeenCalledWith(
        'Authorized-User',
        JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
        }),
        expect.objectContaining({
          domain: 'localhost',
          expires: expect.any(Date),
          httpOnly: true,
          maxAge: 3600,
          secure: false,
        }),
      );
    });

    it('should send access_token in response', async () => {
      await controller.accessTokenV1(mockRequest, mockResponse);
      expect(mockResponse.send).toHaveBeenCalledWith({
        access_token: 'test-token',
      });
    });
  });
});

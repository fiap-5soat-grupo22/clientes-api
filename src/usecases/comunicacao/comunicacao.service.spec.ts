import { Test, TestingModule } from '@nestjs/testing';
import { ComunicacaoService } from './comunicacao.service';
import { DateService } from '../../infrastructure/services/date/date.service';
import { EmailRepository } from '../../infrastructure/repositories/email/email.repository';
import { Consulta } from '../../domain/models/consulta.model';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { MedicoFactory } from '../../infrastructure/factories/medico.factory';
import { PacienteFactory } from '../../infrastructure/factories/paciente.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';

describe('ComunicacaoService', () => {
  let comunicacaoService: ComunicacaoService;
  let dateService: DateService;
  let emailRepository: EmailRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunicacaoService,
        MedicoRepository,
        {
          provide: MedicoRepository,
          useValue: {
            findOne: jest.fn().mockReturnValue({
              nome: 'Dr. Fulano',
              email: 'dr.fulano@email.com',
            }),
          },
        },
        {
          provide: PacienteRepository,
          useValue: {
            findOne: jest.fn().mockReturnValue({
              nome: 'Ciclano',
              email: 'fulano@email.com',
            }),
          },
        },
        PacienteFactory,
        {
          provide: DateService,
          useValue: {
            format: jest.fn(),
          },
        },
        {
          provide: EmailRepository,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    comunicacaoService = module.get<ComunicacaoService>(ComunicacaoService);
    dateService = module.get<DateService>(DateService);
    emailRepository = module.get<EmailRepository>(EmailRepository);
  });

  it('should be defined', () => {
    expect(comunicacaoService).toBeDefined();
  });

  describe('horarioReservado', () => {
    it('should send an email with the correct data', async () => {
      const consulta: Consulta = {
        uid: '123',
        medico: {
          nome: 'Dr. Fulano',
          email: 'dr.fulano@email.com',
        },
        paciente: {
          nome: 'Ciclano',
        },
        inicio: new Date('2023-04-10T10:00:00'),
      } as Consulta;

      jest.spyOn(dateService, 'format').mockReturnValueOnce('10/04/2023').mockReturnValueOnce('10:00');

      const sendEmailSpy = jest
        .spyOn(emailRepository, 'send')
        .mockResolvedValue(true);

      await comunicacaoService.horarioReservado(consulta);

      expect(sendEmailSpy).toHaveBeenCalledWith({
        html: `
    <h3>Olá, Dr. Dr. Fulano!</h3>
    <h4>Você tem uma nova consulta marcada!<h4>
    <p>Paciente: Ciclano</p>.
    <p>Data e horário: 10/04/2023 às 10:00h</p>.
    <p></p>
    <p>Código da consulta: #123</p>
    `,
        subject: 'Health&Med - Nova consulta agendada',
        to: 'dr.fulano@email.com',
      });
    });
  });
});


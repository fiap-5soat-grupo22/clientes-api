import { Test, TestingModule } from '@nestjs/testing';
import { ComunicacaoEvents } from './comunicacao.events';
import { ComunicacaoService } from './comunicacao.service';
import { Consulta } from '../../domain/models/consulta.model';

describe('ComunicacaoEvents', () => {
  let comunicacaoEvents: ComunicacaoEvents;
  let comunicacaoService: ComunicacaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComunicacaoEvents,
        {
          provide: ComunicacaoService,
          useValue: {
            horarioReservado: jest.fn(),
          },
        },
      ],
    }).compile();

    comunicacaoEvents = module.get<ComunicacaoEvents>(ComunicacaoEvents);
    comunicacaoService = module.get<ComunicacaoService>(ComunicacaoService);
  });

  it('should be defined', () => {
    expect(comunicacaoEvents).toBeDefined();
  });

  describe('handleHorarioReservadoEvent', () => {
    it('should call comunicacaoService.horarioReservado', () => {
      const consulta: Consulta = new Consulta();
      comunicacaoEvents.handleHorarioReservadoEvent(consulta);
      expect(comunicacaoService.horarioReservado).toHaveBeenCalledWith(
        consulta,
      );
    });
  });
});


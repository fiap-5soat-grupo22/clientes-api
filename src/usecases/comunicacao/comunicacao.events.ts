import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Consulta } from '../../domain/models/consulta.model';
import { EventosHorario } from '../../infrastructure/enums/eventos-horario.enum';
import { ComunicacaoService } from './comunicacao.service';

@Injectable()
export class ComunicacaoEvents {
  constructor() {}
  @Inject()
  private readonly comunicacaoService: ComunicacaoService;

  @OnEvent(EventosHorario.Reservado, { async: false })
  handleHorarioReservadoEvent(domain: Consulta) {
    return this.comunicacaoService.horarioReservado(domain);
  }
}

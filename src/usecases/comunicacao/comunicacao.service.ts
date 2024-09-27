import { Inject, Injectable } from '@nestjs/common';
import { Consulta } from '../../domain/models/consulta.model';
import { DateService } from '../../infrastructure/services/date/date.service';
import { EmailRepository } from '../../infrastructure/repositories/email/email.repository';

@Injectable()
export class ComunicacaoService {
  @Inject()
  private readonly dateService: DateService;

  @Inject()
  private readonly emailRepository: EmailRepository;

  horarioReservado(consulta: Consulta): Promise<boolean> {
    const subject: string = 'Health&Med - Nova consulta agendada';

    const data = this.dateService.format(consulta.inicio, 'dd/MM/yyyy');
    const horario = this.dateService.format(consulta.inicio, 'HH:mm');

    const html: string = `
    <h3>Olá, Dr. ${consulta.medico.nome}!</h3>
    <h4>Você tem uma nova consulta marcada!<h4>
    <p>Paciente: ${consulta.paciente.nome}</p>.
    <p>Data e horário: ${data} às ${horario}h</p>.
    <p></p>
    <p>Código da consulta: #${consulta.uid}</p>
    `;

    return this.emailRepository.send({
      html,
      subject,
      to: consulta.medico.email,
    });
  }
}

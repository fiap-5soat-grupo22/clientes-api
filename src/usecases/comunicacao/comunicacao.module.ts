import { Module } from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { EmailRepository } from '../../infrastructure/repositories/email/email.repository';
import { DateService } from '../../infrastructure/services/date/date.service';
import { ComunicacaoEvents } from './comunicacao.events';
import { PubSub } from '@google-cloud/pubsub';
import { MailerSend } from 'mailersend';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { MedicoFactory } from '../../infrastructure/factories/medico.factory';
import { PacienteFactory } from '../../infrastructure/factories/paciente.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';

@Module({
  controllers: [],
  providers: [
    ComunicacaoEvents,
    EmailRepository,
    DateService,
    ComunicacaoService,
    MedicoRepository,
    MedicoFactory,
    PacienteRepository,
    PacienteFactory,
    CommonsService,
    { provide: PubSub, useClass: PubSub },
    {
      provide: MailerSend, useFactory: () => {
        return new MailerSend({
          apiKey: process.env.EMAIL_PROVIDER_API_KEY,
        })
      }
    },
  ],
  imports: [],
})
export class ComunicacaoModule { }

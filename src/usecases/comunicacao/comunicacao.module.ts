import { Module } from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { EmailRepository } from '../../infrastructure/repositories/email/email.repository';
import { DateService } from '../../infrastructure/services/date/date.service';
import { ComunicacaoEvents } from './comunicacao.events';
import { PubSub } from '@google-cloud/pubsub';
import { MailerSend } from 'mailersend';

@Module({
  controllers: [],
  providers: [
    ComunicacaoEvents,
    EmailRepository,
    DateService,
    ComunicacaoService,
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

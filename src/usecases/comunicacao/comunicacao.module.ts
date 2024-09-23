import { Module } from '@nestjs/common';
import { ComunicacaoService } from './comunicacao.service';
import { EmailRepository } from '../../infrastructure/repositories/email/event.repository';
import { DateService } from '../../infrastructure/services/date/date.service';
import { ComunicacaoEvents } from './comunicacao.events';

@Module({
  controllers: [],
  providers: [
    ComunicacaoEvents,
    EmailRepository,
    DateService,
    ComunicacaoService,
  ],
  imports: [],
})
export class ComunicacaoModule {}

import { Module } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { MedicoFactory } from '../../infrastructure/factories/medico.factory';
import { ClienteFactory } from '../../infrastructure/factories/cliente.factory';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';

@Module({
  controllers: [MedicosController],

  providers: [
    IdentityRepository,
    MedicoRepository,
    MedicoFactory,
    ClienteFactory,
    AutenticacaoService,
    MedicosService,
    CommonsService,
  ],
})
export class MedicosModule {}

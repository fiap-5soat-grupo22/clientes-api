import { Module } from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { AutenticacaoFactory } from '../../infrastructure/factories/autenticacao.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { IdentityService } from '../../infrastructure/services/identity/identity.service';
import { MedicoFactory } from '../../infrastructure/factories/medico.factory';
import { ClienteFactory } from '../../infrastructure/factories/cliente.factory';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';

@Module({
  controllers: [MedicosController],

  providers: [
    IdentityRepository,
    MedicoRepository,
    MedicoFactory,
    ClienteFactory,
    AutenticacaoFactory,
    MedicosService,
    IdentityService,
    CommonsService,
  ],
})
export class MedicosModule {}

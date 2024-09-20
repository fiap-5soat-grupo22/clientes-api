import { Module } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { PacienteFactory } from '../../infrastructure/factories/paciente.factory';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';

@Module({
  controllers: [PacientesController],
  providers: [
    PacientesService,
    PacienteFactory,
    IdentityRepository,
    PacienteRepository,
    AutenticacaoService,
    CommonsService,
  ],
})
export class PacientesModule {}

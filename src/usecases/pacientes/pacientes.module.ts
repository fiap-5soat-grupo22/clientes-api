import { Module } from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { PacienteFactory } from '../../infrastructure/factories/paciente.factory';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { IdentityService } from '../../infrastructure/services/identity/identity.service';

@Module({
  controllers: [PacientesController],
  providers: [
    PacientesService,
    IdentityService,
    PacienteFactory,
    IdentityRepository,
    PacienteRepository,
    CommonsService,
  ],
})
export class PacientesModule {}

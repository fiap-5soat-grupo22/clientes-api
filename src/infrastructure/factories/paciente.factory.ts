import { Paciente } from '../../domain/paciente.model';
import { PacienteEntity } from '../entities/paciente.entity';
import { Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';
import { ClienteFactory } from './cliente.factory';

@Injectable()
export class PacienteFactory extends ClienteFactory implements IFactory<Paciente, PacienteEntity> {
  
  toEntity(domain: Paciente): PacienteEntity {
    if (!domain) return null;

    const entity: PacienteEntity = {...super.toEntity(domain) };

    return entity;
  }

  toDomain(entity: PacienteEntity): Paciente {
    if (!entity) return null;

    const domain: Paciente = {...super.toDomain(entity) };

    return domain;
  }
}

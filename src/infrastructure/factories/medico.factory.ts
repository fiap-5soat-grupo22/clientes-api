import { Medico } from '../../domain/medico.model';
import { MedicoEntity } from '../entities/medico.entity';
import { Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';
import { ClienteFactory } from './cliente.factory';

@Injectable()
export class MedicoFactory
  extends ClienteFactory
  implements IFactory<Medico, MedicoEntity>
{
  toEntity(domain: Medico): MedicoEntity {
    if (!domain) return null;

    const entity: MedicoEntity = { ...super.toEntity(domain), crm: domain.crm };

    return entity;
  }

  toDomain(entity: MedicoEntity): Medico {
    if (!entity) return null;

    const domain: Medico = { ...super.toDomain(entity), crm: entity.crm };

    return domain;
  }
}

import { Cliente } from '../../domain/models/cliente.model';
import { ClienteEntity } from '../entities/cliente.entity';
import { Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';

@Injectable()
export class ClienteFactory implements IFactory<Cliente, ClienteEntity> {
  toEntity(domain: Cliente): ClienteEntity {
    const entity: ClienteEntity = new ClienteEntity();

    entity.uid = domain?.uid;
    entity.identity = domain?.identity;
    entity.email = domain?.email;
    entity.nome = domain?.nome;
    entity.cpf = domain?.cpf;
    entity.habilidades = domain?.habilidades;
    entity.ativo = domain?.ativo;

    return domain;
  }

  toDomain(entity: ClienteEntity): Cliente {
    const domain: Cliente = new Cliente();

    domain.uid = entity?.uid;
    domain.identity = entity?.identity;
    domain.email = entity?.email;
    domain.nome = entity?.nome;
    domain.cpf = entity?.cpf;
    domain.habilidades = entity?.habilidades;
    domain.ativo = entity?.ativo;

    return domain;
  }
}

import { AutenticacaoEntity } from '../entities/autenticacao.entity';
import { Autenticacao } from '../../domain/autenticacao.model';
import { Inject, Injectable } from '@nestjs/common';
import { IFactory } from '../interfaces/factory.interface';
import { ClienteFactory } from './cliente.factory';

@Injectable()
export class AutenticacaoFactory
  implements IFactory<Autenticacao, AutenticacaoEntity>
{
  @Inject()
  private clienteFactory: ClienteFactory;

  toEntity(domain: Autenticacao): AutenticacaoEntity {
    const entity: AutenticacaoEntity = new AutenticacaoEntity();

    entity.uid = domain.uid ? domain.uid : undefined;
    entity.cliente = this.clienteFactory.toEntity(domain.cliente);
    entity.data = domain.data;
    entity.headers = domain.headers;
    entity.access_token = domain.access_token;
    entity.validade = domain.validade;

    return entity;
  }

  toDomain(entity: AutenticacaoEntity): Autenticacao {
    const domain: Autenticacao = new Autenticacao();

    domain.uid = entity.uid;
    domain.cliente = entity.cliente
      ? this.clienteFactory.toDomain(entity.cliente)
      : undefined;
    domain.data = entity.data;
    domain.headers = entity.headers;
    domain.access_token = entity.access_token;
    domain.validade = entity.validade;

    return domain;
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inject, Injectable } from '@nestjs/common';
import { IAutenticacaoRepository } from '../../../usecases/autenticacao/autenticacao.interface';
import { Autenticacao } from '../../../domain/autenticacao.model';
import { AutenticacaoEntity } from '../../entities/autenticacao.entity';
import { DataSource, MongoRepository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { AutenticacaoFactory } from '../../factories/autenticacao.factory';
import { CommonsService } from '../../services/commons/commons.service';

@Injectable()
export class AutenticacaoRepository implements IAutenticacaoRepository {
  @InjectDataSource('clientes') private dataSource: DataSource;

  @Inject()
  private autenticacaoFactory: AutenticacaoFactory;

  @Inject()
  private commonsService: CommonsService;

  repository: MongoRepository<AutenticacaoEntity> = null;

  async create(domain: Autenticacao): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(AutenticacaoEntity);
    const entity: AutenticacaoEntity =
      this.autenticacaoFactory.toEntity(domain);
    delete entity.uid;
    const persisted: AutenticacaoEntity = await this.repository.save(entity);
    return persisted.uid;
  }

  async findAll(
    skip: string,
    take: string,
    fields?: string,
    filters?: string,
  ): Promise<Autenticacao[]> {
    this.repository = this.dataSource.getMongoRepository(AutenticacaoEntity);
    const domains: Array<Autenticacao> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<AutenticacaoEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: AutenticacaoEntity) => {
      domains.push(this.autenticacaoFactory.toDomain(entity));
    });

    return domains;
  }
  findOne(uid: string, fields?: string): Promise<Autenticacao> {
    throw new Error('Method not implemented.');
  }
  update(uid: string, domain: Autenticacao): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
  remove(uid: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

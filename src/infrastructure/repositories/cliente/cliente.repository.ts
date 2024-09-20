import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, MongoRepository } from 'typeorm';
import { ClienteEntity } from '../../entities/cliente.entity';
import { IClientesRepository } from '../../../usecases/clientes/clientes.interface';
import { UpdateResult, Document, ObjectId } from 'mongodb';
import { ClienteFactory } from '../../factories/cliente.factory';
import { Cliente } from '../../../domain/cliente.model';
import { CommonsService } from '../../services/commons/commons.service';

@Injectable()
export class ClienteRepository implements IClientesRepository {
  @InjectDataSource('clientes')
  private readonly dataSource: DataSource;

  @Inject()
  private readonly clienteFacotry: ClienteFactory;

  @Inject()
  private readonly commonsService: CommonsService;

  private repository: MongoRepository<ClienteEntity> = null;

  async create(domain: Cliente): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(ClienteEntity);
    const entity: ClienteEntity = this.clienteFacotry.toEntity(domain);
    const persisted: ClienteEntity = await this.repository.save(entity);
    return persisted.uid;
  }

  async findByEmail(email: string): Promise<Cliente> {
    this.repository = this.dataSource.getMongoRepository(ClienteEntity);
    const entity: ClienteEntity = await this.repository.findOne({
      where: {
        email,
      },
    });

    return this.clienteFacotry.toDomain(entity);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createWithPassword(domain: Cliente, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async findAll(
    skip: string,
    take: string,
    fields: string,
    filters: string,
  ): Promise<Array<Cliente>> {
    this.repository = this.dataSource.getMongoRepository(ClienteEntity);
    const domains: Array<Cliente> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<ClienteEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: ClienteEntity) => {
      domains.push(this.clienteFacotry.toDomain(entity));
    });

    return domains;
  }

  async findOne(uid: string, fields: string): Promise<Cliente> {
    this.repository = this.dataSource.getMongoRepository(ClienteEntity);
    const select = this.commonsService.queryFieldsArray(
      fields,
    ) as FindOptionsSelect<ClienteEntity>;

    const entity: ClienteEntity = await this.repository.findOne({
      select,
      where: { _id: new ObjectId(uid) },
    });

    return this.clienteFacotry.toDomain(entity);
  }

  async update(uid: string, domain: Cliente): Promise<boolean> {
    this.repository = this.dataSource.getMongoRepository(ClienteEntity);
    const entity: ClienteEntity = this.clienteFacotry.toEntity(domain);

    const resultado: Document | UpdateResult = await this.repository.updateOne(
      { _id: new ObjectId(uid) },
      { $set: entity },
      { upsert: false },
    );

    return resultado.modifiedCount == 1 && resultado.matchedCount == 1;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(uid: string): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}

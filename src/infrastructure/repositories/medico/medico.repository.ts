import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, MongoRepository } from 'typeorm';
import { MedicoEntity } from '../../entities/medico.entity';
import { IMedicosRepository } from '../../../usecases/medicos/medicos.interface';
import { UpdateResult, Document, ObjectId } from 'mongodb';
import { MedicoFactory } from '../../factories/medico.factory';
import { Medico } from '../../../domain/medico.model';
import { CommonsService } from '../../services/commons/commons.service';

@Injectable()
export class MedicoRepository implements IMedicosRepository {
  @InjectDataSource('clientes')
  private readonly dataSource: DataSource;

  @Inject()
  private readonly medicoFactory: MedicoFactory;

  @Inject()
  private readonly commonsService: CommonsService;

  repository: MongoRepository<MedicoEntity> = null;

  async create(domain: Medico): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(MedicoEntity);
    const entity: MedicoEntity = this.medicoFactory.toEntity(domain);
    const persisted: MedicoEntity = await this.repository.save(entity);
    return persisted.uid;
  }

  async findByEmail(email: string): Promise<Medico> {
    this.repository = this.dataSource.getMongoRepository(MedicoEntity);
    const entity: MedicoEntity = await this.repository.findOne({
      where: {
        email,
      },
    });

    return this.medicoFactory.toDomain(entity);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createWithPassword(domain: Medico, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async findAll(
    skip: string,
    take: string,
    fields: string,
    filters: string,
  ): Promise<Array<Medico>> {
    this.repository = this.dataSource.getMongoRepository(MedicoEntity);
    const domains: Array<Medico> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<MedicoEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: MedicoEntity) => {
      domains.push(this.medicoFactory.toDomain(entity));
    });

    return domains;
  }

  async findOne(uid: string, fields: string): Promise<Medico> {
    this.repository = this.dataSource.getMongoRepository(MedicoEntity);
    const select = this.commonsService.queryFieldsArray(
      fields,
    ) as FindOptionsSelect<MedicoEntity>;

    const entity: MedicoEntity = await this.repository.findOne({
      select,
      where: { _id: new ObjectId(uid) },
    });

    return this.medicoFactory.toDomain(entity);
  }

  async update(uid: string, domain: Medico): Promise<boolean> {
    this.repository = this.dataSource.getMongoRepository(MedicoEntity);
    const entity: MedicoEntity = this.medicoFactory.toEntity(domain);

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

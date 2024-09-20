import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, FindOptionsSelect, MongoRepository } from 'typeorm';
import { UpdateResult, Document, ObjectId } from 'mongodb';
import { CommonsService } from '../../services/commons/commons.service';
import { IPacientesRepository } from '../../../usecases/pacientes/pacientes.interface';
import { Paciente } from '../../../domain/paciente.model';
import { PacienteEntity } from '../../entities/paciente.entity';
import { PacienteFactory } from '../../factories/paciente.factory';

@Injectable()
export class PacienteRepository implements IPacientesRepository {
  @InjectDataSource('clientes')
  private readonly dataSource: DataSource;

  @Inject()
  private readonly pacienteFactory: PacienteFactory;

  @Inject()
  private readonly commonsService: CommonsService;

  repository: MongoRepository<PacienteEntity> = null;

  async create(domain: Paciente): Promise<string> {
    this.repository = this.dataSource.getMongoRepository(PacienteEntity);
    const entity: PacienteEntity = this.pacienteFactory.toEntity(domain);
    const persisted: PacienteEntity = await this.repository.save(entity);
    return persisted.uid;
  }

  async findByEmail(email: string): Promise<Paciente> {
    this.repository = this.dataSource.getMongoRepository(PacienteEntity);
    const entity: PacienteEntity = await this.repository.findOne({
      where: {
        email,
      },
    });

    return this.pacienteFactory.toDomain(entity);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  createWithPassword(domain: Paciente, password: string): Promise<string> {
    throw new Error('Method not implemented.');
  }

  async findAll(
    skip: string,
    take: string,
    fields: string,
    filters: string,
  ): Promise<Array<Paciente>> {
    this.repository = this.dataSource.getMongoRepository(PacienteEntity);
    const domains: Array<Paciente> = [];

    const select = this.commonsService.queryFieldsArray(fields);
    const where = this.commonsService.queryFieldsObject(filters);

    const entities: Array<PacienteEntity> = await this.repository.find({
      select,
      where,
      skip: parseInt(skip),
      take: parseInt(take),
    });

    entities.forEach((entity: PacienteEntity) => {
      domains.push(this.pacienteFactory.toDomain(entity));
    });

    return domains;
  }

  async findOne(uid: string, fields: string): Promise<Paciente> {
    this.repository = this.dataSource.getMongoRepository(PacienteEntity);
    const select = this.commonsService.queryFieldsArray(
      fields,
    ) as FindOptionsSelect<PacienteEntity>;

    const entity: PacienteEntity = await this.repository.findOne({
      select,
      where: { _id: new ObjectId(uid) },
    });

    return this.pacienteFactory.toDomain(entity);
  }

  async update(uid: string, domain: Paciente): Promise<boolean> {
    this.repository = this.dataSource.getMongoRepository(PacienteEntity);
    const entity: PacienteEntity = this.pacienteFactory.toEntity(domain);

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

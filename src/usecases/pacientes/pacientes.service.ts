import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { Paciente } from '../../domain/paciente.model';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { TipoCliente } from '../../domain/enums/tipo-cliente.enum';

@Injectable()
export class PacientesService {
  @Inject()
  private identityRepository: IdentityRepository;

  @Inject()
  private pacienteRepository: PacienteRepository;

  async create(createPacienteDto: CreatePacienteDto) {
    const entity: Paciente = this.toDomain(createPacienteDto);

    const existingDatabase = await this.pacienteRepository.findByEmail(
      entity.email,
    );

    const existingProvider = await this.identityRepository.findByEmail(
      entity.email,
    );

    if (existingDatabase || existingProvider) {
      throw new BadRequestException(
        `O paciente já existe com o código ${existingDatabase?.uid || existingProvider?.uid}`,
      );
    }

    entity.identity = await this.identityRepository.createWithPassword(
      entity,
      createPacienteDto.senha,
    );

    entity.ativo = true;
    entity.habilidades = [Habilidade.Paciente];
    entity.tipo = TipoCliente.Paciente;
    const uid = await this.pacienteRepository.create(entity);

    await this.identityRepository.setCustomUserClaims(entity.identity, {
      paciente: { ...entity },
    });

    return uid;
  }

  async findAll(skip: string, take: string, fields: string, filters: string) {
    return this.pacienteRepository.findAll(skip, take, fields, filters);
  }

  async findOne(uid: string, fields: string) {
    return this.pacienteRepository.findOne(uid, fields);
  }

  async update(uid: string, dto: UpdatePacienteDto) {
    let paciente: Paciente = this.toDomain(dto);

    paciente.uid = uid;

    const resultado = await this.pacienteRepository.update(uid, paciente);

    if (!resultado) {
      throw new BadRequestException('paciente não encontrado');
    }

    paciente = await this.findOne(
      uid,
      'identity,ativo,nome,email,cpf,habilidades',
    );

    await this.identityRepository.update(paciente.identity, paciente);

    await this.identityRepository.setCustomUserClaims(paciente.identity, {
      uid,
      ...paciente,
    });

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  async remove(uid: string) {
    const paciente: Paciente = await this.findOne(uid, 'identity');

    if (!paciente) {
      throw new BadRequestException('paciente não encontrado');
    }

    const resultado: boolean = await this.pacienteRepository.update(
      uid,
      paciente,
    );

    if (!resultado) {
      throw new BadRequestException('paciente não encontrado');
    }

    paciente.ativo = false;

    this.identityRepository.update(paciente.identity, paciente);
  }

  private toDomain(dto: CreatePacienteDto | UpdatePacienteDto): Paciente {
    const entity = new Paciente();

    entity.nome = dto.nome;
    entity.email = dto.email;
    entity.cpf = dto.cpf;

    return entity;
  }
}

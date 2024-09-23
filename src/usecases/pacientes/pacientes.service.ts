import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { Paciente } from '../../domain/models/paciente.model';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { PacienteRepository } from '../../infrastructure/repositories/paciente/paciente.repository';
import { FastifyRequest } from 'fastify';
import { Reply } from '../../infrastructure/interfaces/reply.interface';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';

@Injectable()
export class PacientesService {
  @Inject()
  private readonly identityRepository: IdentityRepository;

  @Inject()
  private readonly pacienteRepository: PacienteRepository;

  @Inject()
  private readonly autenticacaoService: AutenticacaoService;

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
    const uid = await this.pacienteRepository.create(entity);

    await this.identityRepository.setCustomUserClaims(entity.identity, {
      uid,
      ...entity,
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

    const resultado = await this.pacienteRepository.update(uid, paciente);

    if (!resultado) {
      throw new NotFoundException('paciente não encontrado');
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
      throw new NotFoundException('paciente não encontrado');
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

  async authenticate(
    request: FastifyRequest,
    response: Reply,
  ): Promise<object> {
    const header = request.headers['authorization'];

    const [email, senha] = this.autenticacaoService.extractCredentials(header);

    if (!email || !senha)
      throw new UnauthorizedException('Credenciais não informadas');

    const token = await this.identityRepository.signInWithEmailAndPassword(
      email,
      senha,
    );

    const cliente: Paciente = await this.pacienteRepository.findByEmail(email);
    const config = this.autenticacaoService.cookiesConfig(token, cliente);
    this.autenticacaoService.setCookiesResponse(request, response, config);

    return config;
  }
}

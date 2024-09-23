import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { MedicoRepository } from '../../infrastructure/repositories/medico/medico.repository';
import { Medico } from '../../domain/models/medico.model';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { AutenticacaoService } from '../../infrastructure/services/autenticacao/autenticacao.service';
import { FastifyRequest } from 'fastify';
import { Reply } from '../../infrastructure/interfaces/reply.interface';

@Injectable()
export class MedicosService {
  @Inject()
  private readonly identityRepository: IdentityRepository;

  @Inject()
  private readonly medicoRepository: MedicoRepository;

  @Inject()
  private readonly autenticacaoService: AutenticacaoService;

  async create(dto: CreateMedicoDto): Promise<string> {
    const medico: Medico = this.toDomain(dto);

    const existingDatabase = await this.medicoRepository.findByEmail(
      medico.email,
    );

    const existingProvider = await this.identityRepository.findByEmail(
      medico.email,
    );

    if (existingDatabase || existingProvider) {
      throw new BadRequestException(
        `O médico já existe com o código ${existingDatabase?.uid || existingProvider?.uid}`,
      );
    }

    medico.identity = await this.identityRepository.createWithPassword(
      medico,
      dto.senha,
    );

    medico.ativo = true;
    medico.habilidades = [Habilidade.Medico];

    const uid = await this.medicoRepository.create(medico);

    await this.identityRepository.setCustomUserClaims(medico.identity, {
      uid,
      ...medico,
    });

    return uid;
  }

  async findAll(skip: string, take: string, fields: string, filters: string) {
    return this.medicoRepository.findAll(skip, take, fields, filters);
  }

  async findOne(uid: string, fields: string) {
    return this.medicoRepository.findOne(uid, fields);
  }

  async update(uid: string, dto: UpdateMedicoDto) {
    let medico: Medico = this.toDomain(dto);

    const resultado = await this.medicoRepository.update(uid, medico);

    if (!resultado) {
      throw new NotFoundException('médico não encontrado');
    }

    medico = await this.findOne(
      uid,
      'identity,ativo,nome,email,cpf,habilidades,crm',
    );

    await this.identityRepository.update(medico.identity, medico);

    await this.identityRepository.setCustomUserClaims(medico.identity, {
      uid,
      ...medico,
    });

    return {
      message: 'ok',
      statusCode: 200,
    };
  }

  async remove(uid: string) {
    const medico: Medico = await this.findOne(uid, 'identity');

    if (!medico) {
      throw new NotFoundException('médico não encontrado');
    }

    const resultado: boolean = await this.medicoRepository.update(uid, medico);

    if (!resultado) {
      throw new BadRequestException('médico não encontrado');
    }

    medico.ativo = false;

    this.identityRepository.update(medico.identity, medico);
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

    const cliente: Medico = await this.medicoRepository.findByEmail(email);

    const config = this.autenticacaoService.cookiesConfig(token, cliente);
    this.autenticacaoService.setCookiesResponse(request, response, config);

    return config;
  }

  private toDomain(dto: CreateMedicoDto | UpdateMedicoDto): Medico {
    const medico = new Medico();

    medico.nome = dto.nome;
    medico.email = dto.email;
    medico.cpf = dto.cpf;
    medico.crm = dto.crm;

    return medico;
  }
}

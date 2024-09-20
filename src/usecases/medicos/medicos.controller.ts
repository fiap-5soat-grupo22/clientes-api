import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Version,
  UseGuards,
  Inject,
  DefaultValuePipe,
  Req,
  Res,
} from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Habilidades } from '../../infrastructure/decorators/habilidades.decorators';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { IdentityGuard } from '../../infrastructure/guards/identity/identity.guard';
import { AcessoPublico } from '../../infrastructure/decorators/acesso-publico.decorators';
import { FastifyRequest } from 'fastify';

import { Reply } from '../../infrastructure/interfaces/reply.interface';

@Controller('medicos')
@ApiTags('Médicos')
@UseGuards(IdentityGuard)
export class MedicosController {
  @Inject()
  private readonly medicosService: MedicosService;

  @Inject()
  private readonly autenticacaoService: MedicosService;

  @ApiOperation({ description: 'Cadastra um novo médico' })
  @ApiResponse({
    status: 201,
    description: 'Médico criado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados informados na requisição inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @AcessoPublico()
  @Version('1')
  @Post()
  createV1(@Body() createMedicoDto: CreateMedicoDto) {
    return this.medicosService.create(createMedicoDto);
  }

  @ApiOperation({ description: 'Autentica um médico com email e senha' })
  @ApiResponse({
    status: 201,
    description: 'Access Token gerado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Dados informados na requisição inválidos',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @AcessoPublico()
  @ApiBasicAuth('basic')
  @Version('1')
  @Post('/oauth2/access-token')
  accessTokenV1(@Req() request: FastifyRequest, @Res() response: Reply) {
    return this.medicosService.authenticate(request, response);
  }

  @ApiOperation({ description: 'Listagem dos médicos cadastrados' })
  @ApiQuery({
    name: 'skip',
    required: false,
    example: 0,
    description: `
    Início da paginação
    `,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    example: 10,
    description: `
    Quantidade de registros por página
  `,
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    example: 'nome,crm,email,cpf,habilidades',
    description: `
    Campos retornados, separados por virgula. Ex: nome,crm
    `,
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description: `
      Campos de filtros, no formato chave valor separados por vírgulas. Ex: nome=joao
      `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na listagem dos médicos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum médico encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get()
  findAllV1(
    @Query('skip', new DefaultValuePipe(0)) skip: string,
    @Query('take', new DefaultValuePipe(10)) take: string,
    @Query('fields', new DefaultValuePipe('nome,crm')) fields: string,
    @Query('filters', new DefaultValuePipe('ativo=true')) filters: string,
  ) {
    return this.medicosService.findAll(skip, take, fields, filters);
  }

  @ApiOperation({ description: 'Informações de um médico' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do médico' })
  @ApiQuery({
    name: 'fields',
    required: false,
    example: 'nome,crm',
    description: `
    Campos retornados, separados por virgula
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na listagem dos médicos.',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum médico encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get(':uid')
  findOneV1(
    @Param('uid') uid: string,
    @Query('fields', new DefaultValuePipe('nome,crm')) fields: string,
  ) {
    return this.medicosService.findOne(uid, fields);
  }

  @ApiOperation({ description: 'Altera informações cadatrais de um médico' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do médico' })
  @ApiBody({ type: UpdateMedicoDto })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na listagem dos médicos.',
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhum médico encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Post(':uid')
  updateV1(
    @Param('uid') uid: string,
    @Body() updateMedicoDto: UpdateMedicoDto,
  ) {
    return this.medicosService.update(uid, updateMedicoDto);
  }

  @ApiOperation({ description: 'Desativa um médico' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do médico' })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na desativação do médico.',
  })
  @ApiResponse({
    status: 400,
    description: 'Nenhum médico encontrado',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @ApiBearerAuth()
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Delete(':uid')
  removeV1(@Param('uid') uid: string): Promise<void> {
    return this.medicosService.remove(uid);
  }
}

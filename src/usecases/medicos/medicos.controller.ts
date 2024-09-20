import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Version,
  UseGuards,
  Inject,
  DefaultValuePipe,
} from '@nestjs/common';
import { MedicosService } from './medicos.service';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';

import {
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

@Controller('medicos')
@ApiTags('Medicos')
@ApiBearerAuth()
@UseGuards(IdentityGuard)
export class MedicosController {
  @Inject()
  private readonly medicosService: MedicosService;

  @ApiOperation({ description: 'Cadastra um novo médico' })
  @ApiResponse({
    status: 201,
    description: 'Médico criado.',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados informados na requisição inválidos',
  })
  @AcessoPublico()
  @Version('1')
  @Post()
  createV1(@Body() createMedicoDto: CreateMedicoDto) {
    return this.medicosService.create(createMedicoDto);
  }

  @ApiOperation({ description: 'Listagem dos médicos cadastrados' })
  @ApiQuery({
    name: 'skip',
    required: false,
    description: 'Início da paginação',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    description: 'Quantidade de registros por página',
  })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Campos retornados, separados por virgula. Ex: nome,crm',
  })
  @ApiQuery({
    name: 'filters',
    required: false,
    description:
      'Campos de filtros, no formato chave valor separados por vírgulas. Ex: nome=joao ',
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
    description: 'Campos retornados, separados por virgula. Ex: nome,crm',
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
  @ApiBody({ type: CreateMedicoDto })
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
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Patch(':uid')
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
  @Habilidades(Habilidade.Medico)
  @Version('1')
  @Delete(':uid')
  removeV1(@Param('uid') uid: string): Promise<void> {
    return this.medicosService.remove(uid);
  }
}

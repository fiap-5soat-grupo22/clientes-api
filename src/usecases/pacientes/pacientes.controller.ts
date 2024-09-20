import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Version,
  DefaultValuePipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { AcessoPublico } from '../../infrastructure/decorators/acesso-publico.decorators';
import { Habilidade } from '../../domain/enums/habilidade.enum';
import { Habilidades } from '../../infrastructure/decorators/habilidades.decorators';
import { IdentityGuard } from '../../infrastructure/guards/identity/identity.guard';

@Controller('pacientes')
@ApiTags('Pacientes')
@ApiBearerAuth()
@UseGuards(IdentityGuard)
export class PacientesController {
  @Inject()
  private readonly pacientesService: PacientesService;

  @ApiOperation({ description: 'Cadastra um novo paciente' })
  @ApiResponse({
    status: 201,
    description: 'Sucesso na criação do paciente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @AcessoPublico()
  @Version('1')
  @Post()
  createV1(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @ApiOperation({ description: 'Listagem dos pacientes cadastrados' })
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
    description: 'Sucesso na listagem dos pacientes.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum paciente encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get()
  findAllV1(
    @Query('skip', new DefaultValuePipe(0)) skip: string,
    @Query('take', new DefaultValuePipe(10)) take: string,
    @Query('fields', new DefaultValuePipe('nome')) fields: string,
    @Query('filters', new DefaultValuePipe('ativo=true')) filters: string,
  ) {
    return this.pacientesService.findAll(skip, take, fields, filters);
  }

  @ApiOperation({ description: 'Informações de um paciente' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do paciente' })
  @ApiQuery({
    name: 'fields',
    required: false,
    description: 'Campos retornados, separados por virgula. Ex: nome,crm',
  })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na consulta do paciente.',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum paciente encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @Habilidades(Habilidade.Paciente, Habilidade.Medico)
  @Version('1')
  @Get(':uid')
  findOneV1(
    @Param('uid') uid: string,
    @Query('fields', new DefaultValuePipe('nome')) fields: string,
  ) {
    return this.pacientesService.findOne(uid, fields);
  }

  @ApiOperation({ description: 'Altera informações cadatrais de um paciente' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do paciente' })
  @ApiBody({ type: CreatePacienteDto })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na atualização do paciente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum paciente encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @Habilidades(Habilidade.Paciente)
  @Version('1')
  @Patch(':uid')
  updateV1(
    @Param('uid') uid: string,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ) {
    return this.pacientesService.update(uid, updatePacienteDto);
  }

  @ApiOperation({ description: 'Desativa um paciente' })
  @ApiParam({ name: 'uid', required: true, description: 'Código do paciente' })
  @ApiResponse({
    status: 200,
    description: 'Sucesso na desativação do paciente.',
  })
  @ApiResponse({
    status: 400,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: 401,
    description: 'Nenhuma autenticação válida informada',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhum paciente encontrado',
  })
  @ApiResponse({
    status: 500,
    description: 'Sistema indisponível',
  })
  @Habilidades(Habilidade.Paciente)
  @Version('1')
  @Delete(':uid')
  removeV1(@Param('uid') uid: string): Promise<void> {
    return this.pacientesService.remove(uid);
  }
}

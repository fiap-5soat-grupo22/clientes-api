import {
  Controller,
  Post,
  RawBodyRequest,
  Req,
  Res,
  UseGuards,
  Version,
} from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { FastifyRequest } from 'fastify';
import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CookieConfig } from '../../infrastructure/interfaces/cookie-config.interface';
import { Reply } from '../../infrastructure/interfaces/reply.interface';

@UseGuards(ThrottlerGuard)
@Controller('autenticacao')
@ApiTags('Autenticação')
@ApiBearerAuth()
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Version('1')
  @Post('access-token')
  @ApiBasicAuth('basic')
  @ApiResponse({
    status: 201,
    description: 'Access Token gerado.',
  })
  @ApiResponse({
    status: 401,
    description: 'Dados informados na requisição inválidos',
  })
  async accessTokenV1(
    @Req() request: RawBodyRequest<FastifyRequest>,
    @Res() response: Reply,
  ) {
    const { headers } = request;

    const config: CookieConfig = (await this.autenticacaoService.basic(
      headers as unknown as Map<string, string>,
    )) as CookieConfig;

    config.domain = request.hostname.split(':')[0];

    response.setCookie('Authorization', config['access_token'], config);
    response.setCookie(
      'Authorized-User',
      JSON.stringify(config['usuario']),
      config,
    );

    response.send({ access_token: config['access_token'] });
  }
}

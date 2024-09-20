import { Module } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoController } from './autenticacao.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule } from '@nestjs/throttler';
import { IdentityRepository } from '../../infrastructure/repositories/identity/identity.repository';
import { CacheRepository } from '../../infrastructure/repositories/cache/cache.repository';
import { AutenticacaoRepository } from '../../infrastructure/repositories/autenticacao/autenticacao.repository';
import { AutenticacaoFactory } from '../../infrastructure/factories/autenticacao.factory';
import { CommonsService } from '../../infrastructure/services/commons/commons.service';
import { IdentityService } from '../../infrastructure/services/identity/identity.service';
import { ClienteFactory } from '../../infrastructure/factories/cliente.factory';
import { ClienteRepository } from '../../infrastructure/repositories/cliente/cliente.repository';
@Module({
  imports: [
    CacheModule.register({
      ttl: 60 * 50, // seconds
      max: 100, // maximum number of items in cache
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AutenticacaoController],
  providers: [
    AutenticacaoRepository,
    IdentityRepository,
    CacheRepository,
    ClienteRepository,
    ClienteFactory,
    AutenticacaoFactory,
    AutenticacaoService,
    IdentityService,
    CommonsService,
  ],
})
export class AutenticacaoModule {}

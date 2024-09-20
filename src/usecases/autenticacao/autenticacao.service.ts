import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CacheRepository } from '../../infrastructure/repositories/cache/cache.repository';
import { addHours, parseISO } from 'date-fns';
import { AutenticacaoRepository } from '../../infrastructure/repositories/autenticacao/autenticacao.repository';
import { Autenticacao } from '../../domain/autenticacao.model';
import { Cliente } from '../../domain/cliente.model';
import { IdentityService } from '../../infrastructure/services/identity/identity.service';
import { ClienteRepository } from '../../infrastructure/repositories/cliente/cliente.repository';

@Injectable()
export class AutenticacaoService {
  @Inject()
  private identityService: IdentityService;
  @Inject()
  private autenticacaoRepository: AutenticacaoRepository;
  @Inject()
  private clienteRepository: ClienteRepository;
  @Inject()
  private cacheRepository: CacheRepository;

  async basic(headers: Map<string, string>): Promise<object> {
    const cache = await this.checkCache(headers);

    if (cache) return cache;

    const [email, senha] = this.extractAuthorizationHeader(headers);

    if (!email || !senha)
      throw new UnauthorizedException('usuário ou senha inválidos');

    const token = await this.identityService.signInWithEmailAndPassword(
      email,
      senha,
    );

    const cliente: Cliente = await this.clienteRepository.findByEmail(email);

    const config = {
      expires: addHours(new Date(), 1),
      httpOnly: true,
      maxAge: 3600,
      secure: false,
      access_token: token,
      cliente,
    };

    await this.cacheRepository.set(
      headers['authorization'],
      JSON.stringify(config),
    );

    const autenticacao: Autenticacao = new Autenticacao();
    autenticacao.cliente = cliente;
    autenticacao.access_token = token;
    autenticacao.data = new Date();
    autenticacao.headers = headers;
    autenticacao.validade = config.expires;

    await this.autenticacaoRepository.create(autenticacao);

    return config;
  }

  async findAll(skip: string, take: string, fields: string, filters: string) {
    return this.autenticacaoRepository.findAll(skip, take, fields, filters);
  }

  extractAuthorizationHeader(headers: Map<string, string>): Array<string> {
    try {
      const decoded = Buffer.from(
        headers['authorization']?.split(' ')[1],
        'base64',
      ).toString('utf-8');

      return decoded.split(':');
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async checkCache(headers: Map<string, string>): Promise<object | null> {
    const cache: string = await this.cacheRepository.get(
      headers['authorization'],
    );

    if (cache) {
      const cachedConfig = JSON.parse(cache);
      cachedConfig.expires = parseISO(cachedConfig.expires);
      return cachedConfig;
    } else {
      return null;
    }
  }
}

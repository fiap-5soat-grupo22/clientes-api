import { FastifyRequest } from 'fastify';
import { Cliente } from '../../domain/cliente.model';

export interface Request extends FastifyRequest {
  getCookies(): object;
  cookies: { [cookieName: string]: string };
  cliente: Cliente;
}

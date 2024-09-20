import { Cliente } from '../../domain/cliente.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IClientesRepository extends IRepository<Cliente, string> {
  createWithPassword(domain: Cliente, password: string): Promise<string>;
  findByEmail(email: string): Promise<Cliente>;
}

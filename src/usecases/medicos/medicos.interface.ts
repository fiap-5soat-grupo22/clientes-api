import { Medico } from '../../domain/medico.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IMedicosRepository extends IRepository<Medico, string> {
  createWithPassword(domain: Medico, password: string): Promise<string>;
  findByEmail(email: string): Promise<Medico>;
}

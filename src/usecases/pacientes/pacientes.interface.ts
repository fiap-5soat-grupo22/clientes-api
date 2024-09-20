import { Paciente } from '../../domain/paciente.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IPacientesRepository extends IRepository<Paciente, string> {
  createWithPassword(domain: Paciente, password: string): Promise<string>;
  findByEmail(email: string): Promise<Paciente>;
}

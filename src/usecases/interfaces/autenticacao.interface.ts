import { Medico } from '../../domain/medico.model';
import { Paciente } from '../../domain/paciente.model';

export interface IAutenticacaoRepository {
  createWithPassword(
    domain: Medico | Paciente,
    password: string,
  ): Promise<string>;
  findByEmail(email: string): Promise<Medico | Paciente>;
  signInWithEmailAndPassword(email: string, password: string): Promise<string>;
  verifyIdToken(token: string): Promise<Medico | Paciente>;
  setCustomUserClaims(uid: string, customClains: object): Promise<boolean>;
}

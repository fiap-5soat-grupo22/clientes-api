import { Autenticacao } from '../../domain/autenticacao.model';
import { IRepository } from '../../infrastructure/interfaces/repository.interface';

export interface IAutenticacaoRepository
  extends IRepository<Autenticacao, string> {}

import { TipoCliente } from './enums/tipo-cliente.enum';

export class Cliente {
  uid: string;
  identity: string;
  email: string;
  nome: string;
  cpf: string;
  habilidades: string[];
  tipo: TipoCliente;
  ativo: boolean;
}

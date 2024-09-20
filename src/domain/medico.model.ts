import { Cliente } from './cliente.model';
import { TipoCliente } from './enums/tipo-cliente.enum';

export class Medico extends Cliente {
  tipo: TipoCliente;
  crm: string;
}

import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { TipoCliente } from '../../domain/enums/tipo-cliente.enum';

@Entity({
  name: 'clientes',
})
export class ClienteEntity {
  @ObjectIdColumn()
  uid: string;

  @Column()
  identity: string;

  @Column()
  nome: string;

  @Column()
  email: string;

  @Column()
  cpf: string;

  @Column()
  habilidades: string[];

  @Column()
  tipo: TipoCliente;

  @Column()
  ativo: boolean;
}

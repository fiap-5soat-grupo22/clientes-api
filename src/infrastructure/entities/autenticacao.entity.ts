import { Column, Entity, ObjectIdColumn } from 'typeorm';
import { ClienteEntity } from './cliente.entity';

@Entity({
  name: 'autenticacoes',
})
export class AutenticacaoEntity {
  @ObjectIdColumn()
  uid: string;

  @Column()
  cliente: ClienteEntity;

  @Column()
  data: Date;

  @Column()
  access_token: string;

  @Column()
  validade: Date;

  @Column()
  headers: Map<string, string>;
}

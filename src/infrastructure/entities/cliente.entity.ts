import { Column, ObjectIdColumn } from 'typeorm';

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
  ativo: boolean;
}

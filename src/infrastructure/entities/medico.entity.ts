import { Column, Entity } from 'typeorm';
import { ClienteEntity } from './cliente.entity';

@Entity({
  name: 'clientes',
})
export class MedicoEntity extends ClienteEntity {
  @Column()
  crm: string;
}

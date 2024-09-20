import { Column, Entity } from 'typeorm';
import { ClienteEntity } from './cliente.entity';

@Entity({
  name: 'clientes',
})
export class PacienteEntity extends ClienteEntity {}

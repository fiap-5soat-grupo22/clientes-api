import { Entity } from 'typeorm';
import { ClienteEntity } from './cliente.entity';

@Entity({
  name: 'pacientes',
})
export class PacienteEntity extends ClienteEntity {}

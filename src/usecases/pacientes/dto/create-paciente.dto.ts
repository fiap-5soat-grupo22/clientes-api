import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { PacienteDto } from './paciente.dto';

export class CreatePacienteDto extends PacienteDto {
  @IsNotEmpty()
  @Length(5, 20, {
    message: `senha deve ter de 5 à 20 caracteres`,
  })
  @ApiProperty({
    description: 'senha para acesso ao sistema',
    example: '12345678',
  })
  senha: string;
}

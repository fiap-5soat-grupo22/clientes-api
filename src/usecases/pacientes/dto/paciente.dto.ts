import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  Length,
  Contains,
  IsEmail,
  IsNumberString,
} from 'class-validator';

export class PacienteDto {
  @IsNotEmpty()
  @Length(4, 50, {
    message: `nome deve ter de 4 a 50 caracteres`,
  })
  @Contains(' ', {
    message: `nome deve conter nome e sobrenome`,
  })
  @ApiProperty({
    description: 'Nome do paciente',
    example: 'José Antônio da Silva',
  })
  nome: string;

  @IsEmail(
    {},
    {
      message: `email inválido`,
    },
  )
  @ApiProperty({
    description: 'Email do paciente',
    example: 'paciente@fiap.com.br',
  })
  email: string;

  @IsNotEmpty()
  @Length(11, 11, {
    message: `nome deve ter 11 caracteres numéricos`,
  })
  @IsNumberString(
    {
      no_symbols: true,
    },
    {
      message: `cpf deve ter 11 caracteres numéricos`,
    },
  )
  @ApiProperty({
    description: 'CPF do paciente, sem pontuação e com zeros à esquerda',
    example: '37255731821',
  })
  cpf: string;
}

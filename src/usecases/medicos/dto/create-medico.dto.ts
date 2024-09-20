import { ApiProperty } from '@nestjs/swagger';
import { Contains, IsEmail, IsNumberString, Length } from 'class-validator';
import { IsNotEmpty } from '../../../infrastructure/decorators/is-not-empty/is-not-empty.decorator';

export class CreateMedicoDto {
  @IsNotEmpty()
  @Length(4, 50, {
    message: `nome deve ter de 4 a 50 caracteres`,
  })
  @Contains(' ', {
    message: `nome deve conter nome e sobrenome`,
  })
  @ApiProperty({
    description: 'Nome do medico',
    example: 'João da Silva',
  })
  nome: string;

  @IsEmail(
    {},
    {
      message: `email inválido`,
    },
  )
  @ApiProperty({
    description: 'Email do médico',
    example: 'medico@fiap.com.br',
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
    description: 'CPF do medico, sem pontuação e com zeros à esquerda',
    example: '37255731821',
  })
  cpf: string;

  @IsNotEmpty()
  @Length(5, 20, {
    message: `crm deve ter de 5 à 20 caracteres`,
  })
  @ApiProperty({
    description: 'crm do medico',
    example: '3723532-SP',
  })
  crm: string;

  @IsNotEmpty()
  @Length(5, 20, {
    message: `crm deve ter de 5 à 20 caracteres`,
  })
  @ApiProperty({
    description: 'senha para acesso ao sistema',
    example: '12345678',
  })
  senha: string;
}

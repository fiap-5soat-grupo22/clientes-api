import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { IsNotEmpty } from '../../../infrastructure/decorators/is-not-empty/is-not-empty.decorator';
import { MedicoDto } from './medico.dto';

export class CreateMedicoDto extends MedicoDto {
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

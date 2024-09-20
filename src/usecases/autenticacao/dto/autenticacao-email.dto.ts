import { IsEmail, IsNotEmpty } from 'class-validator';

export class AutenticacaoEmailDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}

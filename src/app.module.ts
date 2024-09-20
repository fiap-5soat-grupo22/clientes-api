import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { AutenticacaoModule } from './usecases/autenticacao/autenticacao.module';
import { MedicosModule } from './usecases/medicos/medicos.module';
import { MedicoEntity } from './infrastructure/entities/medico.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteEntity } from './infrastructure/entities/cliente.entity';
import { AutenticacaoEntity } from './infrastructure/entities/autenticacao.entity';
import { PacientesModule } from './usecases/pacientes/pacientes.module';
import { PacienteEntity } from './infrastructure/entities/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mongodb',
      name: 'clientes',
      database: 'clientes',
      url: process.env.MONGODB_URL,
      authSource: 'admin',
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature(
      [MedicoEntity, ClienteEntity, PacienteEntity, AutenticacaoEntity],
      'clientes',
    ),
    AutenticacaoModule,
    MedicosModule,
    RouterModule.register([
      {
        path: '/',
        children: [
          {
            path: '/',
            module: AutenticacaoModule,
          },
          {
            path: '/',
            module: MedicosModule,
          },
          {
            path: '/',
            module: PacientesModule,
          },
        ],
      },
    ]),
    PacientesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

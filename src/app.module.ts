import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RouterModule } from '@nestjs/core';
import { MedicosModule } from './usecases/medicos/medicos.module';
import { MedicoEntity } from './infrastructure/entities/medico.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesModule } from './usecases/pacientes/pacientes.module';
import { PacienteEntity } from './infrastructure/entities/paciente.entity';
import { AutenticacaoService } from './infrastructure/services/autenticacao/autenticacao.service';
import { EventRepository } from './infrastructure/repositories/event/event.repository';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ComunicacaoModule } from './usecases/comunicacao/comunicacao.module';
import { PubSub } from '@google-cloud/pubsub';
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
    TypeOrmModule.forFeature([MedicoEntity, PacienteEntity], 'clientes'),
    RouterModule.register([
      {
        path: '/',
        children: [
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
    MedicosModule,
    PacientesModule,
    ComunicacaoModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, AutenticacaoService, EventRepository, PubSub],
})
export class AppModule {}

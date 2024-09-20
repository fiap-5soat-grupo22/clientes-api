import { Injectable } from '@nestjs/common';
import {
  FirebaseAuthError,
  getAuth as getAuthAdmin,
  UserRecord,
} from 'firebase-admin/auth';
import { Cliente } from '../../../domain/cliente.model';
import { IClientesRepository } from '../../../usecases/clientes/clientes.interface';

@Injectable()
export class IdentityRepository implements IClientesRepository {
  constructor() {}

  async createWithPassword(domain: Cliente, password: string): Promise<string> {
    const userRecord: UserRecord = await getAuthAdmin().createUser({
      email: domain.email,
      emailVerified: false,
      password: password,
      displayName: domain.nome,
      disabled: false,
    });

    return userRecord.uid;
  }

  async findByEmail(email: string): Promise<Cliente> {
    try {
      const userRecord: UserRecord = await getAuthAdmin().getUserByEmail(email);
      return this.fromUserRecord(userRecord);
    } catch (error) {
      if (error instanceof FirebaseAuthError) {
        return null;
      } else {
        throw error;
      }
    }
  }

  async setCustomUserClaims(
    uid: string,
    customClains: object,
  ): Promise<boolean> {
    try {
      await getAuthAdmin().setCustomUserClaims(uid, customClains);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  create(entity: Cliente): Promise<string> {
    throw new Error('Method not implemented.');
  }

  findAll(): Promise<Array<Cliente>> {
    throw new Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findOne(uid: string): Promise<Cliente> {
    throw new Error('Method not implemented.');
  }
  async update(uid: string, entity: Cliente): Promise<boolean> {
    await getAuthAdmin().updateUser(uid, {
      displayName: entity.nome,
      email: entity.email,
      disabled: !entity.ativo,
    });

    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async remove(uid: string): Promise<boolean> {
    throw 'Método não implementado';
  }

  fromUserRecord(entity: UserRecord): Cliente {
    const domain: Cliente = new Cliente();

    domain.email = entity.email;
    domain.nome = entity.displayName;
    domain.identity = entity.uid;
    domain.ativo = !entity.disabled;
    domain.cpf = entity.customClaims.cliente['cpf'];
    domain.habilidades = entity.customClaims.cliente['habilidades'];
    domain.tipo = entity.customClaims.cliente['tipo'];
    domain.uid = entity.customClaims.cliente['uid'];

    return domain;
  }
}

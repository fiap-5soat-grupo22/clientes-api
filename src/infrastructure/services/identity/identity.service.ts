import { Injectable } from '@nestjs/common';
import { DecodedIdToken, getAuth as getAuthAdmin } from 'firebase-admin/auth';

import {
  getAuth as getAuthApp,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { Cliente } from '../../../domain/cliente.model';

@Injectable()
export class IdentityService {
  constructor() {}

  async signInWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<string> {
    const userCredential: UserCredential = await signInWithEmailAndPassword(
      getAuthApp(),
      email,
      password,
    );
    return userCredential.user.getIdToken();
  }

  async verifyIdToken(token: string): Promise<Cliente> {
    const decoded: DecodedIdToken = await getAuthAdmin().verifyIdToken(token);
    return this.fromUserRecord(decoded);
  }

  private fromUserRecord(entity: DecodedIdToken): Cliente {
    const domain: Cliente = new Cliente();

    domain.email = entity.email;
    domain.nome = entity.displayName;
    domain.identity = entity.uid;
    domain.habilidades = entity.cliente['habilidades'];
    domain.tipo = entity.cliente['tipo'];

    return domain;
  }
}

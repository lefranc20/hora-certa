import type { UsuarioComSenha } from "./auth.types.js";

export interface UsuarioRepository {
  buscarPorEmail(email: string): Promise<UsuarioComSenha | null>;
}

export class InMemoryUsuarioRepository implements UsuarioRepository {
  constructor(private readonly usuarios: UsuarioComSenha[] = []) {}

  async buscarPorEmail(email: string): Promise<UsuarioComSenha | null> {
    return this.usuarios.find((u) => u.email === email) ?? null;
  }
}

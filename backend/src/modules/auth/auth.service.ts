import type { UsuarioRepository } from "./usuario.repository.js";
import type { UsuarioAutenticado } from "./auth.types.js";
import { verificarSenha } from "./senha.js";
import { gerarToken } from "./token.js";

export class CredenciaisInvalidasError extends Error {
  constructor() {
    super("Email ou senha inválidos.");
    this.name = "CredenciaisInvalidasError";
  }
}

export interface LoginInput {
  email: string;
  senha: string;
}

export interface LoginResultado {
  token: string;
  usuario: UsuarioAutenticado;
}

export class AuthService {
  constructor(private readonly repository: UsuarioRepository) {}

  async login({ email, senha }: LoginInput): Promise<LoginResultado> {
    const usuario = await this.repository.buscarPorEmail(email);
    if (!usuario) {
      throw new CredenciaisInvalidasError();
    }

    const senhaValida = await verificarSenha(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new CredenciaisInvalidasError();
    }

    const usuarioAutenticado: UsuarioAutenticado = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      papel: usuario.papel,
      profissionalId: usuario.profissionalId,
    };

    const token = gerarToken({
      sub: usuarioAutenticado.id,
      nome: usuarioAutenticado.nome,
      email: usuarioAutenticado.email,
      papel: usuarioAutenticado.papel,
      profissionalId: usuarioAutenticado.profissionalId,
    });

    return { token, usuario: usuarioAutenticado };
  }
}

import { prisma } from "../../lib/prisma.js";
import type { UsuarioRepository } from "./usuario.repository.js";
import type { UsuarioComSenha } from "./auth.types.js";

export class PrismaUsuarioRepository implements UsuarioRepository {
  async buscarPorEmail(email: string): Promise<UsuarioComSenha | null> {
    return prisma.usuario.findUnique({ where: { email } });
  }
}

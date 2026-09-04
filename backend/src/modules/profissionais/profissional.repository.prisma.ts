import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { ProfissionalRepository } from "./profissional.repository.js";
import type { Profissional } from "./profissional.types.js";

export class PrismaProfissionalRepository implements ProfissionalRepository {
  async listar(opts?: { apenasAtivos?: boolean }): Promise<Profissional[]> {
    return prisma.profissional.findMany({
      where: opts?.apenasAtivos ? { ativo: true } : undefined,
      orderBy: { nome: "asc" },
    });
  }

  async buscarPorId(id: string): Promise<Profissional | null> {
    return prisma.profissional.findUnique({ where: { id } });
  }

  async criar(dados: { nome: string }): Promise<Profissional> {
    return prisma.profissional.create({ data: { nome: dados.nome } });
  }

  async atualizar(
    id: string,
    dados: Partial<{ nome: string; ativo: boolean }>,
  ): Promise<Profissional | null> {
    try {
      return await prisma.profissional.update({ where: { id }, data: dados });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }
      throw error;
    }
  }
}

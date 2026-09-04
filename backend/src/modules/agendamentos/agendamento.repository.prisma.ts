import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { AgendamentoRepository, FiltroListagem } from "./agendamento.repository.js";
import type { Agendamento } from "./agendamento.types.js";

const COM_PROFISSIONAL = {
  profissional: { select: { id: true, nome: true } },
} as const;

export class PrismaAgendamentoRepository implements AgendamentoRepository {
  async listar(filtro?: FiltroListagem): Promise<Agendamento[]> {
    return prisma.agendamento.findMany({
      where: {
        profissionalId: filtro?.profissionalId,
        canceladoEm: filtro?.incluirCancelados ? undefined : null,
      },
      include: COM_PROFISSIONAL,
      orderBy: { inicio: "asc" },
    });
  }

  async buscarPorId(id: string): Promise<Agendamento | null> {
    return prisma.agendamento.findUnique({ where: { id }, include: COM_PROFISSIONAL });
  }

  async salvar(agendamento: Agendamento): Promise<void> {
    await prisma.agendamento.create({
      data: {
        id: agendamento.id,
        cliente: agendamento.cliente,
        servico: agendamento.servico,
        inicio: agendamento.inicio,
        fim: agendamento.fim,
        profissionalId: agendamento.profissionalId,
      },
    });
  }

  async existeConflito(
    profissionalId: string,
    inicio: Date,
    fim: Date,
  ): Promise<boolean> {
    const conflito = await prisma.agendamento.findFirst({
      where: {
        profissionalId,
        canceladoEm: null,
        inicio: { lt: fim },
        fim: { gt: inicio },
      },
    });
    return conflito !== null;
  }

  async cancelar(
    id: string,
    dados: { canceladoEm: Date; observacaoCancelamento: string | null },
  ): Promise<Agendamento | null> {
    try {
      return await prisma.agendamento.update({
        where: { id },
        data: dados,
        include: COM_PROFISSIONAL,
      });
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

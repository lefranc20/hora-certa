import { prisma } from "../../lib/prisma.js";
import type { AgendamentoRepository } from "./agendamento.repository.js";
import type { Agendamento } from "./agendamento.types.js";

export class PrismaAgendamentoRepository implements AgendamentoRepository {
  async listar(): Promise<Agendamento[]> {
    return prisma.agendamento.findMany({ orderBy: { inicio: "asc" } });
  }

  async salvar(agendamento: Agendamento): Promise<void> {
    await prisma.agendamento.create({ data: agendamento });
  }

  async existeConflito(inicio: Date, fim: Date): Promise<boolean> {
    const conflito = await prisma.agendamento.findFirst({
      where: {
        inicio: { lt: fim },
        fim: { gt: inicio },
      },
    });
    return conflito !== null;
  }
}

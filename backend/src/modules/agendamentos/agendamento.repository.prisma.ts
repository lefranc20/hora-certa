import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
  AgendamentoRepository,
  FiltroListagem,
  ResultadoSalvar,
} from "./agendamento.repository.js";
import type { Agendamento } from "./agendamento.types.js";

const COM_PROFISSIONAL = {
  profissional: { select: { id: true, nome: true } },
} as const;

const RESTRICAO_SOBREPOSICAO = "Agendamento_sem_sobreposicao";
const EXCLUSION_VIOLATION = "23P01";

/** O Prisma não mapeia violação de EXCLUDE: o erro do banco chega como texto. */
function ehSobreposicaoDeHorario(erro: unknown): boolean {
  const meta =
    erro instanceof Prisma.PrismaClientKnownRequestError
      ? (erro.meta as { code?: string; constraint?: string } | undefined)
      : undefined;

  if (meta?.code === EXCLUSION_VIOLATION || meta?.constraint === RESTRICAO_SOBREPOSICAO) {
    return true;
  }

  const mensagem = erro instanceof Error ? erro.message : String(erro);
  return (
    mensagem.includes(EXCLUSION_VIOLATION) || mensagem.includes(RESTRICAO_SOBREPOSICAO)
  );
}

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

  async salvar(agendamento: Agendamento): Promise<ResultadoSalvar> {
    try {
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
      return "criado";
    } catch (error) {
      if (ehSobreposicaoDeHorario(error)) {
        return "conflito";
      }
      throw error;
    }
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

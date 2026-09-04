import type { Agendamento } from "./agendamento.types.js";

export interface FiltroListagem {
  profissionalId?: string;
  incluirCancelados?: boolean;
}

export interface AgendamentoRepository {
  listar(filtro?: FiltroListagem): Promise<Agendamento[]>;
  buscarPorId(id: string): Promise<Agendamento | null>;
  salvar(agendamento: Agendamento): Promise<void>;
  existeConflito(profissionalId: string, inicio: Date, fim: Date): Promise<boolean>;
  cancelar(
    id: string,
    dados: { canceladoEm: Date; observacaoCancelamento: string | null },
  ): Promise<Agendamento | null>;
}

export class InMemoryAgendamentoRepository implements AgendamentoRepository {
  private agendamentos: Agendamento[] = [];

  async listar(filtro?: FiltroListagem): Promise<Agendamento[]> {
    return this.agendamentos.filter((a) => {
      if (filtro?.profissionalId && a.profissionalId !== filtro.profissionalId) {
        return false;
      }
      if (!filtro?.incluirCancelados && a.canceladoEm !== null) {
        return false;
      }
      return true;
    });
  }

  async buscarPorId(id: string): Promise<Agendamento | null> {
    return this.agendamentos.find((a) => a.id === id) ?? null;
  }

  async salvar(agendamento: Agendamento): Promise<void> {
    this.agendamentos.push(agendamento);
  }

  async existeConflito(
    profissionalId: string,
    inicio: Date,
    fim: Date,
  ): Promise<boolean> {
    return this.agendamentos.some(
      (a) =>
        a.profissionalId === profissionalId &&
        a.canceladoEm === null &&
        inicio < a.fim &&
        fim > a.inicio,
    );
  }

  async cancelar(
    id: string,
    dados: { canceladoEm: Date; observacaoCancelamento: string | null },
  ): Promise<Agendamento | null> {
    const agendamento = this.agendamentos.find((a) => a.id === id);
    if (!agendamento) return null;

    agendamento.canceladoEm = dados.canceladoEm;
    agendamento.observacaoCancelamento = dados.observacaoCancelamento;
    return agendamento;
  }
}

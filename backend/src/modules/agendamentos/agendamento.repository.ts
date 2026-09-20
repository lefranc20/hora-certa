import type { Agendamento } from "./agendamento.types.js";

export interface FiltroListagem {
  profissionalId?: string;
  incluirCancelados?: boolean;
}

/** "conflito" quando o banco recusou o agendamento por sobreposição. */
export type ResultadoSalvar = "criado" | "conflito";

export interface AgendamentoRepository {
  listar(filtro?: FiltroListagem): Promise<Agendamento[]>;
  buscarPorId(id: string): Promise<Agendamento | null>;
  salvar(agendamento: Agendamento): Promise<ResultadoSalvar>;
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

  /** Faz o papel da restrição do banco, independente de `existeConflito`. */
  private sobrepoe(profissionalId: string, inicio: Date, fim: Date): boolean {
    return this.agendamentos.some(
      (a) =>
        a.profissionalId === profissionalId &&
        a.canceladoEm === null &&
        inicio < a.fim &&
        fim > a.inicio,
    );
  }

  async salvar(agendamento: Agendamento): Promise<ResultadoSalvar> {
    if (
      this.sobrepoe(agendamento.profissionalId, agendamento.inicio, agendamento.fim)
    ) {
      return "conflito";
    }

    this.agendamentos.push(agendamento);
    return "criado";
  }

  async existeConflito(
    profissionalId: string,
    inicio: Date,
    fim: Date,
  ): Promise<boolean> {
    return this.sobrepoe(profissionalId, inicio, fim);
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

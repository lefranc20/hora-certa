import type { Agendamento } from "./agendamento.types.js";

export interface AgendamentoRepository {
  listar(): Promise<Agendamento[]>;
  salvar(agendamento: Agendamento): Promise<void>;
  existeConflito(inicio: Date, fim: Date): Promise<boolean>;
}

export class InMemoryAgendamentoRepository implements AgendamentoRepository {
  private agendamentos: Agendamento[] = [];

  async listar(): Promise<Agendamento[]> {
    return this.agendamentos;
  }

  async salvar(agendamento: Agendamento): Promise<void> {
    this.agendamentos.push(agendamento);
  }

  async existeConflito(inicio: Date, fim: Date): Promise<boolean> {
    return this.agendamentos.some((a) => inicio < a.fim && fim > a.inicio);
  }
}

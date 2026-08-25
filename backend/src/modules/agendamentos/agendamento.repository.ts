import type { Agendamento } from "./agendamento.types.js";

export class AgendamentoRepository {
  private agendamentos: Agendamento[] = [];

  listar(): Agendamento[] {
    return this.agendamentos;
  }

  salvar(agendamento: Agendamento): void {
    this.agendamentos.push(agendamento);
  }

  existeConflito(inicio: Date, fim: Date): boolean {
    return this.agendamentos.some((a) => inicio < a.fim && fim > a.inicio);
  }
}

import { randomUUID } from "node:crypto";
import type { AgendamentoRepository } from "./agendamento.repository.js";
import type { Agendamento } from "./agendamento.types.js";


export class ConflitoDeHorarioError extends Error {
  constructor() {
    super("Já existe um agendamento nesse horário.");
    this.name = "ConflitoDeHorarioError";
  }
}

interface CriarAgendamentoInput {
  cliente: string;
  servico: string;
  inicio: Date;
  duracaoMinutos: number;
}

export class AgendamentoService {
  constructor(private readonly repository: AgendamentoRepository) {}

  async criar(dados: CriarAgendamentoInput): Promise<Agendamento> {
    const fim = new Date(dados.inicio.getTime() + dados.duracaoMinutos * 60_000);

    if (await this.repository.existeConflito(dados.inicio, fim)) {
      throw new ConflitoDeHorarioError();
    }

    const agendamento: Agendamento = {
      id: randomUUID(),
      cliente: dados.cliente,
      servico: dados.servico,
      inicio: dados.inicio,
      fim,
    };

    await this.repository.salvar(agendamento);
    return agendamento;
  }

  async listar(): Promise<Agendamento[]> {
    return this.repository.listar();
  }
}

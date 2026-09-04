import { randomUUID } from "node:crypto";
import type { Papel } from "../auth/auth.types.js";
import type { ProfissionalRepository } from "../profissionais/profissional.repository.js";
import type { AgendamentoRepository, FiltroListagem } from "./agendamento.repository.js";
import type { Agendamento } from "./agendamento.types.js";

export class ConflitoDeHorarioError extends Error {
  constructor() {
    super("Já existe um agendamento nesse horário.");
    this.name = "ConflitoDeHorarioError";
  }
}

export class ProfissionalInvalidoError extends Error {
  constructor() {
    super("Profissional não encontrado ou inativo.");
    this.name = "ProfissionalInvalidoError";
  }
}

export class AgendamentoNaoEncontradoError extends Error {
  constructor() {
    super("Agendamento não encontrado.");
    this.name = "AgendamentoNaoEncontradoError";
  }
}

export class AgendamentoJaCanceladoError extends Error {
  constructor() {
    super("Este agendamento já foi cancelado.");
    this.name = "AgendamentoJaCanceladoError";
  }
}

export class AcessoNegadoError extends Error {
  constructor() {
    super("Você só pode cancelar os seus próprios agendamentos.");
    this.name = "AcessoNegadoError";
  }
}

export interface CriarAgendamentoInput {
  cliente: string;
  servico: string;
  inicio: Date;
  duracaoMinutos: number;
  profissionalId: string;
}

export interface QuemCancela {
  papel: Papel;
  profissionalId: string | null;
}

export class AgendamentoService {
  constructor(
    private readonly repository: AgendamentoRepository,
    private readonly profissionais: ProfissionalRepository,
  ) {}

  async criar(dados: CriarAgendamentoInput): Promise<Agendamento> {
    const profissional = await this.profissionais.buscarPorId(dados.profissionalId);
    if (!profissional || !profissional.ativo) {
      throw new ProfissionalInvalidoError();
    }

    const fim = new Date(dados.inicio.getTime() + dados.duracaoMinutos * 60_000);

    if (await this.repository.existeConflito(dados.profissionalId, dados.inicio, fim)) {
      throw new ConflitoDeHorarioError();
    }

    const agendamento: Agendamento = {
      id: randomUUID(),
      cliente: dados.cliente,
      servico: dados.servico,
      inicio: dados.inicio,
      fim,
      profissionalId: dados.profissionalId,
      canceladoEm: null,
      observacaoCancelamento: null,
    };

    await this.repository.salvar(agendamento);
    return agendamento;
  }

  async listar(filtro?: FiltroListagem): Promise<Agendamento[]> {
    return this.repository.listar(filtro);
  }

  async cancelar(
    id: string,
    quemCancela: QuemCancela,
    observacao: string | null,
  ): Promise<Agendamento> {
    const agendamento = await this.repository.buscarPorId(id);
    if (!agendamento) {
      throw new AgendamentoNaoEncontradoError();
    }
    if (agendamento.canceladoEm !== null) {
      throw new AgendamentoJaCanceladoError();
    }
    if (
      quemCancela.papel === "PROFISSIONAL" &&
      agendamento.profissionalId !== quemCancela.profissionalId
    ) {
      throw new AcessoNegadoError();
    }

    const cancelado = await this.repository.cancelar(id, {
      canceladoEm: new Date(),
      observacaoCancelamento: observacao,
    });
    return cancelado as Agendamento;
  }
}

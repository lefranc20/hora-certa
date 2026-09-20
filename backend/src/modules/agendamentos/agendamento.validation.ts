import type { Papel } from "../auth/auth.types.js";
import type { CriarAgendamentoInput } from "./agendamento.service.js";

export const CAMPOS_OBRIGATORIOS = [
  "cliente",
  "servico",
  "inicio",
  "duracaoMinutos",
  "profissionalId",
] as const;

export type CampoObrigatorio = (typeof CAMPOS_OBRIGATORIOS)[number];

export const MENSAGEM_CAMPOS_OBRIGATORIOS =
  "Todos os campos são obrigatórios para realizar o agendamento.";
export const MENSAGEM_INICIO_NO_PASSADO =
  "O horário de início precisa ser no futuro.";

export type ResultadoValidacao =
  | { ok: true; dados: CriarAgendamentoInput }
  | { ok: false; mensagem: string; camposInvalidos: CampoObrigatorio[] };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function data(valor: unknown): Date {
  return typeof valor === "string" ? new Date(valor) : new Date(Number.NaN);
}

function numero(valor: unknown): number {
  return typeof valor === "number" || typeof valor === "string"
    ? Number(valor)
    : Number.NaN;
}

/** Valida o corpo de POST /agendamentos. `agora` é injetável para os testes. */
export function validarEntradaAgendamento(
  corpo: unknown,
  agora: Date = new Date(),
): ResultadoValidacao {
  const entrada = (corpo ?? {}) as Record<string, unknown>;
  const camposInvalidos: CampoObrigatorio[] = [];

  const cliente = texto(entrada.cliente);
  if (cliente === "") camposInvalidos.push("cliente");

  const servico = texto(entrada.servico);
  if (servico === "") camposInvalidos.push("servico");

  const inicio = data(entrada.inicio);
  if (Number.isNaN(inicio.getTime())) camposInvalidos.push("inicio");

  const duracaoMinutos = numero(entrada.duracaoMinutos);
  if (!Number.isFinite(duracaoMinutos) || duracaoMinutos <= 0) {
    camposInvalidos.push("duracaoMinutos");
  }

  const profissionalId = texto(entrada.profissionalId);
  if (profissionalId === "") camposInvalidos.push("profissionalId");

  if (camposInvalidos.length > 0) {
    return {
      ok: false,
      mensagem: MENSAGEM_CAMPOS_OBRIGATORIOS,
      camposInvalidos,
    };
  }

  if (inicio.getTime() <= agora.getTime()) {
    return {
      ok: false,
      mensagem: MENSAGEM_INICIO_NO_PASSADO,
      camposInvalidos: ["inicio"],
    };
  }

  return {
    ok: true,
    dados: { cliente, servico, inicio, duracaoMinutos, profissionalId },
  };
}

export type ResultadoValidacaoCancelamento =
  | { ok: true; dados: { observacao: string | null } }
  | { ok: false; mensagem: string };

/** Observação é obrigatória para PROFISSIONAL e opcional para ADMIN. */
export function validarCancelamento(
  corpo: unknown,
  papel: Papel,
): ResultadoValidacaoCancelamento {
  const entrada = (corpo ?? {}) as Record<string, unknown>;
  const observacao = texto(entrada.observacao);

  if (papel === "PROFISSIONAL" && observacao === "") {
    return {
      ok: false,
      mensagem: "Informe uma observação para cancelar este agendamento.",
    };
  }

  return { ok: true, dados: { observacao: observacao === "" ? null : observacao } };
}

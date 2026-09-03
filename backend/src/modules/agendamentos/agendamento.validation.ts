import type { CriarAgendamentoInput } from "./agendamento.service.js";

export const CAMPOS_OBRIGATORIOS = [
  "cliente",
  "servico",
  "inicio",
  "duracaoMinutos",
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

/**
 * Valida o corpo cru de um POST /agendamentos.
 * Todos os campos são obrigatórios e `inicio` precisa ser no futuro.
 * Devolve os dados já normalizados quando válidos, ou a mensagem
 * de erro com os campos que causaram a falha.
 *
 * `agora` é injetável para deixar os testes independentes do relógio.
 */
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

  return { ok: true, dados: { cliente, servico, inicio, duracaoMinutos } };
}

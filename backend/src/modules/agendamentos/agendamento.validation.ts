import type { CriarAgendamentoInput } from "./agendamento.service.js";

export const CAMPOS_OBRIGATORIOS = [
  "cliente",
  "servico",
  "inicio",
  "duracaoMinutos",
] as const;

export type CampoObrigatorio = (typeof CAMPOS_OBRIGATORIOS)[number];

export type ResultadoValidacao =
  | { ok: true; dados: CriarAgendamentoInput }
  | { ok: false; camposInvalidos: CampoObrigatorio[] };

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
 * Todos os campos são obrigatórios; devolve os dados já normalizados
 * quando válidos, ou a lista de campos que faltaram/vieram inválidos.
 */
export function validarEntradaAgendamento(corpo: unknown): ResultadoValidacao {
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
    return { ok: false, camposInvalidos };
  }

  return { ok: true, dados: { cliente, servico, inicio, duracaoMinutos } };
}

import { api } from "./client";

export interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  inicio: string;
  fim: string;
  profissionalId: string;
  profissional: { id: string; nome: string };
  canceladoEm: string | null;
  observacaoCancelamento: string | null;
}

export interface NovoAgendamento {
  cliente: string;
  servico: string;
  inicio: string;
  duracaoMinutos: number;
  profissionalId: string;
}

export async function listarAgendamentos(profissionalId: string): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>("/agendamentos", {
    params: { profissionalId },
  });
  return data;
}

export async function criarAgendamento(dados: NovoAgendamento): Promise<Agendamento> {
  const { data } = await api.post<Agendamento>("/agendamentos", dados);
  return data;
}

export async function listarAgendaConsolidada(): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>("/agendamentos/todos");
  return data;
}

export async function listarMinhaAgenda(): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>("/agendamentos/minha-agenda");
  return data;
}

export async function cancelarAgendamento(
  id: string,
  observacao?: string,
): Promise<Agendamento> {
  const { data } = await api.patch<Agendamento>(`/agendamentos/${id}/cancelar`, {
    observacao,
  });
  return data;
}

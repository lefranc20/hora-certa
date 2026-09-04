import { api } from "./client";

export interface Profissional {
  id: string;
  nome: string;
  ativo: boolean;
  criadoEm: string;
}

export async function listarProfissionaisAtivos(): Promise<Profissional[]> {
  const { data } = await api.get<Profissional[]>("/profissionais");
  return data;
}

export async function listarTodosProfissionais(): Promise<Profissional[]> {
  const { data } = await api.get<Profissional[]>("/profissionais/todos");
  return data;
}

export async function criarProfissional(nome: string): Promise<Profissional> {
  const { data } = await api.post<Profissional>("/profissionais", { nome });
  return data;
}

export async function atualizarProfissional(
  id: string,
  dados: Partial<{ nome: string; ativo: boolean }>,
): Promise<Profissional> {
  const { data } = await api.patch<Profissional>(`/profissionais/${id}`, dados);
  return data;
}

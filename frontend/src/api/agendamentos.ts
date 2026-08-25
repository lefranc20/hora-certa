import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
});

export interface Agendamento {
  id: string;
  cliente: string;
  servico: string;
  inicio: string;
  fim: string;
}

export interface NovoAgendamento {
  cliente: string;
  servico: string;
  inicio: string;
  duracaoMinutos: number;
}

export async function listarAgendamentos(): Promise<Agendamento[]> {
  const { data } = await api.get<Agendamento[]>("/agendamentos");
  return data;
}

export async function criarAgendamento(dados: NovoAgendamento): Promise<Agendamento> {
  const { data } = await api.post<Agendamento>("/agendamentos", dados);
  return data;
}

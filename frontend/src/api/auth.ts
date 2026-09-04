import { api } from "./client";

export type Papel = "ADMIN" | "PROFISSIONAL";

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  profissionalId: string | null;
}

export interface LoginResultado {
  token: string;
  usuario: UsuarioAutenticado;
}

export async function login(email: string, senha: string): Promise<LoginResultado> {
  const { data } = await api.post<LoginResultado>("/auth/login", { email, senha });
  return data;
}

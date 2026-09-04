export type Papel = "ADMIN" | "PROFISSIONAL";

export interface UsuarioAutenticado {
  id: string;
  nome: string;
  email: string;
  papel: Papel;
  profissionalId: string | null;
}

export interface UsuarioComSenha {
  id: string;
  nome: string;
  email: string;
  senhaHash: string;
  papel: Papel;
  profissionalId: string | null;
}

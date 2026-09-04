import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { login as loginApi, type UsuarioAutenticado } from "../api/auth";
import { CHAVE_TOKEN } from "../api/client";

const CHAVE_USUARIO = "horacerta.usuario";

interface AuthContextValor {
  usuario: UsuarioAutenticado | null;
  entrar: (email: string, senha: string) => Promise<UsuarioAutenticado>;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValor | null>(null);

function usuarioSalvo(): UsuarioAutenticado | null {
  const bruto = localStorage.getItem(CHAVE_USUARIO);
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as UsuarioAutenticado;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(() => usuarioSalvo());

  const valor = useMemo<AuthContextValor>(
    () => ({
      usuario,
      async entrar(email, senha) {
        const resultado = await loginApi(email, senha);
        localStorage.setItem(CHAVE_TOKEN, resultado.token);
        localStorage.setItem(CHAVE_USUARIO, JSON.stringify(resultado.usuario));
        setUsuario(resultado.usuario);
        return resultado.usuario;
      },
      sair() {
        localStorage.removeItem(CHAVE_TOKEN);
        localStorage.removeItem(CHAVE_USUARIO);
        setUsuario(null);
      },
    }),
    [usuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValor {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth precisa ser usado dentro de um AuthProvider.");
  }
  return contexto;
}

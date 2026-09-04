import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";
import type { Papel } from "../api/auth";

function rotaHomeDoPapel(papel: Papel): string {
  return papel === "ADMIN" ? "/interna/admin" : "/interna/agenda";
}

export function RotaProtegida({
  papel,
  children,
}: {
  papel: Papel;
  children: ReactNode;
}) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/interna/entrar" replace />;
  }

  if (usuario.papel !== papel) {
    return <Navigate to={rotaHomeDoPapel(usuario.papel)} replace />;
  }

  return <>{children}</>;
}

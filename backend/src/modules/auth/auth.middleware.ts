import type { NextFunction, Request, Response } from "express";
import { verificarToken } from "./token.js";
import type { Papel } from "./auth.types.js";

export function autenticar(req: Request, res: Response, next: NextFunction): void {
  const cabecalho = req.header("authorization");
  const token = cabecalho?.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) {
    res.status(401).json({ erro: "Token não informado." });
    return;
  }

  try {
    const payload = verificarToken(token);
    req.usuario = {
      id: payload.sub,
      nome: payload.nome,
      email: payload.email,
      papel: payload.papel,
      profissionalId: payload.profissionalId,
    };
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado." });
  }
}

export function exigirPapel(...papeis: Papel[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ erro: "Não autenticado." });
      return;
    }
    if (!papeis.includes(req.usuario.papel)) {
      res.status(403).json({ erro: "Acesso negado para este papel." });
      return;
    }
    next();
  };
}

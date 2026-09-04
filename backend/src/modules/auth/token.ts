import "dotenv/config";
import jwt from "jsonwebtoken";
import type { Papel } from "./auth.types.js";

export interface PayloadToken {
  sub: string;
  nome: string;
  email: string;
  papel: Papel;
  profissionalId: string | null;
}

function segredo(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) {
    throw new Error("JWT_SECRET não configurado.");
  }
  return valor;
}

export function gerarToken(payload: PayloadToken): string {
  return jwt.sign(payload, segredo(), { expiresIn: "8h" });
}

export function verificarToken(token: string): PayloadToken {
  return jwt.verify(token, segredo()) as PayloadToken;
}

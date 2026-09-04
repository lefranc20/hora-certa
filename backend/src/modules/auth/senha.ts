import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const TAMANHO_HASH = 64;

export async function gerarHashSenha(senha: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(senha, salt, TAMANHO_HASH)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verificarSenha(
  senha: string,
  hashArmazenado: string,
): Promise<boolean> {
  const [salt, hashHex] = hashArmazenado.split(":");
  if (!salt || !hashHex) return false;

  const hashEsperado = Buffer.from(hashHex, "hex");
  const hashCalculado = (await scryptAsync(senha, salt, TAMANHO_HASH)) as Buffer;

  if (hashEsperado.length !== hashCalculado.length) return false;
  return timingSafeEqual(hashEsperado, hashCalculado);
}

export type ResultadoValidacaoLogin =
  | { ok: true; dados: { email: string; senha: string } }
  | { ok: false; mensagem: string };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

export function validarCredenciaisLogin(corpo: unknown): ResultadoValidacaoLogin {
  const entrada = (corpo ?? {}) as Record<string, unknown>;

  const email = texto(entrada.email);
  const senha = typeof entrada.senha === "string" ? entrada.senha : "";

  if (email === "" || senha === "") {
    return { ok: false, mensagem: "Informe email e senha." };
  }

  return { ok: true, dados: { email, senha } };
}

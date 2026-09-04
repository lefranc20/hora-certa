export type ResultadoValidacaoCriacao =
  | { ok: true; dados: { nome: string } }
  | { ok: false; mensagem: string };

export type ResultadoValidacaoAtualizacao =
  | { ok: true; dados: Partial<{ nome: string; ativo: boolean }> }
  | { ok: false; mensagem: string };

function texto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

export function validarEntradaProfissional(corpo: unknown): ResultadoValidacaoCriacao {
  const entrada = (corpo ?? {}) as Record<string, unknown>;
  const nome = texto(entrada.nome);

  if (nome === "") {
    return { ok: false, mensagem: "Informe o nome do profissional." };
  }

  return { ok: true, dados: { nome } };
}

export function validarAtualizacaoProfissional(
  corpo: unknown,
): ResultadoValidacaoAtualizacao {
  const entrada = (corpo ?? {}) as Record<string, unknown>;
  const dados: Partial<{ nome: string; ativo: boolean }> = {};

  if (entrada.nome !== undefined) {
    const nome = texto(entrada.nome);
    if (nome === "") {
      return { ok: false, mensagem: "O nome não pode ser vazio." };
    }
    dados.nome = nome;
  }

  if (entrada.ativo !== undefined) {
    if (typeof entrada.ativo !== "boolean") {
      return { ok: false, mensagem: "O campo 'ativo' precisa ser verdadeiro ou falso." };
    }
    dados.ativo = entrada.ativo;
  }

  if (Object.keys(dados).length === 0) {
    return { ok: false, mensagem: "Informe ao menos um campo para atualizar." };
  }

  return { ok: true, dados };
}

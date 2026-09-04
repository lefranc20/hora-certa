import { describe, expect, it } from "vitest";
import {
  validarAtualizacaoProfissional,
  validarEntradaProfissional,
} from "./profissional.validation.js";

describe("validarEntradaProfissional", () => {
  it("aceita nome válido", () => {
    const resultado = validarEntradaProfissional({ nome: "Ana Souza" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.dados.nome).toBe("Ana Souza");
  });

  it("rejeita nome ausente", () => {
    expect(validarEntradaProfissional({}).ok).toBe(false);
  });

  it("rejeita nome vazio ou só espaços", () => {
    expect(validarEntradaProfissional({ nome: "   " }).ok).toBe(false);
  });
});

describe("validarAtualizacaoProfissional", () => {
  it("aceita atualizar só o nome", () => {
    const resultado = validarAtualizacaoProfissional({ nome: "Novo Nome" });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.dados).toEqual({ nome: "Novo Nome" });
  });

  it("aceita atualizar só o ativo", () => {
    const resultado = validarAtualizacaoProfissional({ ativo: false });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.dados).toEqual({ ativo: false });
  });

  it("rejeita 'ativo' que não é boolean", () => {
    const resultado = validarAtualizacaoProfissional({ ativo: "sim" });

    expect(resultado.ok).toBe(false);
  });

  it("rejeita corpo vazio", () => {
    expect(validarAtualizacaoProfissional({}).ok).toBe(false);
  });
});

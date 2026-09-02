import { describe, expect, it } from "vitest";
import { validarEntradaAgendamento } from "./agendamento.validation.js";

const entradaValida = {
  cliente: "Ana",
  servico: "Corte",
  inicio: "2026-10-01T10:00:00",
  duracaoMinutos: 30,
};

describe("validarEntradaAgendamento", () => {
  it("aceita uma entrada completa e devolve os dados normalizados", () => {
    const resultado = validarEntradaAgendamento(entradaValida);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.dados.cliente).toBe("Ana");
      expect(resultado.dados.servico).toBe("Corte");
      expect(resultado.dados.inicio).toBeInstanceOf(Date);
      expect(resultado.dados.duracaoMinutos).toBe(30);
    }
  });

  it("remove espaços em volta de cliente e servico", () => {
    const resultado = validarEntradaAgendamento({
      ...entradaValida,
      cliente: "  Ana  ",
      servico: "  Corte  ",
    });

    expect(resultado.ok && resultado.dados.cliente).toBe("Ana");
    expect(resultado.ok && resultado.dados.servico).toBe("Corte");
  });

  it("aponta o campo que faltou", () => {
    const resultado = validarEntradaAgendamento({
      servico: "Corte",
      inicio: "2026-10-01T10:00:00",
      duracaoMinutos: 30,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toEqual(["cliente"]);
    }
  });

  it("trata string vazia ou só espaços como ausente", () => {
    const resultado = validarEntradaAgendamento({
      ...entradaValida,
      cliente: "   ",
      servico: "",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toEqual(
        expect.arrayContaining(["cliente", "servico"]),
      );
    }
  });

  it("rejeita data inválida", () => {
    const resultado = validarEntradaAgendamento({
      ...entradaValida,
      inicio: "não é uma data",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toContain("inicio");
    }
  });

  it("rejeita duração ausente, zero, negativa ou não numérica", () => {
    for (const duracaoMinutos of [undefined, 0, -15, "abc"]) {
      const resultado = validarEntradaAgendamento({
        ...entradaValida,
        duracaoMinutos,
      });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.camposInvalidos).toContain("duracaoMinutos");
      }
    }
  });

  it("lista todos os campos de uma vez quando o corpo vem vazio", () => {
    const resultado = validarEntradaAgendamento({});

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toEqual([
        "cliente",
        "servico",
        "inicio",
        "duracaoMinutos",
      ]);
    }
  });

  it("não quebra com corpo undefined ou não-objeto", () => {
    expect(validarEntradaAgendamento(undefined).ok).toBe(false);
    expect(validarEntradaAgendamento("texto solto").ok).toBe(false);
  });
});

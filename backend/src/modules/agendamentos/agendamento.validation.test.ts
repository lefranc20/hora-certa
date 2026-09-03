import { describe, expect, it } from "vitest";
import { validarEntradaAgendamento } from "./agendamento.validation.js";

const AGORA = new Date("2026-09-02T12:00:00.000Z");

const entradaValida = {
  cliente: "Ana",
  servico: "Corte",
  inicio: "2026-09-10T10:00:00.000Z",
  duracaoMinutos: 30,
};

const validar = (corpo: unknown) => validarEntradaAgendamento(corpo, AGORA);

describe("validarEntradaAgendamento", () => {
  it("aceita uma entrada completa e devolve os dados normalizados", () => {
    const resultado = validar(entradaValida);

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.dados.cliente).toBe("Ana");
      expect(resultado.dados.servico).toBe("Corte");
      expect(resultado.dados.inicio).toBeInstanceOf(Date);
      expect(resultado.dados.duracaoMinutos).toBe(30);
    }
  });

  it("remove espaços em volta de cliente e servico", () => {
    const resultado = validar({
      ...entradaValida,
      cliente: "  Ana  ",
      servico: "  Corte  ",
    });

    expect(resultado.ok && resultado.dados.cliente).toBe("Ana");
    expect(resultado.ok && resultado.dados.servico).toBe("Corte");
  });

  it("aponta o campo que faltou", () => {
    const resultado = validar({
      servico: "Corte",
      inicio: entradaValida.inicio,
      duracaoMinutos: 30,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toEqual(["cliente"]);
      expect(resultado.mensagem).toMatch(/obrigatórios/i);
    }
  });

  it("trata string vazia ou só espaços como ausente", () => {
    const resultado = validar({
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
    const resultado = validar({ ...entradaValida, inicio: "não é uma data" });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toContain("inicio");
    }
  });

  it("rejeita duração ausente, zero, negativa ou não numérica", () => {
    for (const duracaoMinutos of [undefined, 0, -15, "abc"]) {
      const resultado = validar({ ...entradaValida, duracaoMinutos });

      expect(resultado.ok).toBe(false);
      if (!resultado.ok) {
        expect(resultado.camposInvalidos).toContain("duracaoMinutos");
      }
    }
  });

  it("lista todos os campos de uma vez quando o corpo vem vazio", () => {
    const resultado = validar({});

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

  it("rejeita início no passado", () => {
    const resultado = validar({
      ...entradaValida,
      inicio: "2026-09-01T10:00:00.000Z",
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toEqual(["inicio"]);
      expect(resultado.mensagem).toMatch(/futuro/i);
    }
  });

  it("campo ausente tem prioridade sobre início no passado", () => {
    const resultado = validar({
      servico: "Corte",
      inicio: "2020-01-01T00:00:00.000Z",
      duracaoMinutos: 30,
    });

    expect(resultado.ok).toBe(false);
    if (!resultado.ok) {
      expect(resultado.camposInvalidos).toContain("cliente");
      expect(resultado.mensagem).toMatch(/obrigatórios/i);
    }
  });

  it("não quebra com corpo undefined ou não-objeto", () => {
    expect(validar(undefined).ok).toBe(false);
    expect(validar("texto solto").ok).toBe(false);
  });
});

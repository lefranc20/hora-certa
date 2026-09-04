import { describe, expect, it } from "vitest";
import { validarCredenciaisLogin } from "./auth.validation.js";

describe("validarCredenciaisLogin", () => {
  it("aceita email e senha válidos", () => {
    const resultado = validarCredenciaisLogin({
      email: "admin@horacerta.dev",
      senha: "admin123",
    });

    expect(resultado.ok).toBe(true);
    if (resultado.ok) {
      expect(resultado.dados.email).toBe("admin@horacerta.dev");
      expect(resultado.dados.senha).toBe("admin123");
    }
  });

  it("rejeita quando falta email", () => {
    const resultado = validarCredenciaisLogin({ senha: "admin123" });

    expect(resultado.ok).toBe(false);
  });

  it("rejeita quando falta senha", () => {
    const resultado = validarCredenciaisLogin({ email: "admin@horacerta.dev" });

    expect(resultado.ok).toBe(false);
  });

  it("não quebra com corpo undefined", () => {
    expect(validarCredenciaisLogin(undefined).ok).toBe(false);
  });
});

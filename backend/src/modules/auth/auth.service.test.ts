import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUsuarioRepository } from "./usuario.repository.js";
import { AuthService, CredenciaisInvalidasError } from "./auth.service.js";
import { gerarHashSenha } from "./senha.js";
import type { UsuarioComSenha } from "./auth.types.js";

describe("AuthService", () => {
  let service: AuthService;
  let admin: UsuarioComSenha;

  beforeEach(async () => {
    admin = {
      id: "usuario-1",
      nome: "Admin",
      email: "admin@horacerta.dev",
      senhaHash: await gerarHashSenha("admin123"),
      papel: "ADMIN",
      profissionalId: null,
    };
    service = new AuthService(new InMemoryUsuarioRepository([admin]));
  });

  it("autentica com email e senha corretos e devolve token + usuário", async () => {
    const resultado = await service.login({
      email: "admin@horacerta.dev",
      senha: "admin123",
    });

    expect(resultado.token).toBeDefined();
    expect(resultado.usuario).toEqual({
      id: "usuario-1",
      nome: "Admin",
      email: "admin@horacerta.dev",
      papel: "ADMIN",
      profissionalId: null,
    });
  });

  it("rejeita email inexistente", async () => {
    await expect(
      service.login({ email: "nao-existe@horacerta.dev", senha: "admin123" }),
    ).rejects.toThrow(CredenciaisInvalidasError);
  });

  it("rejeita senha incorreta", async () => {
    await expect(
      service.login({ email: "admin@horacerta.dev", senha: "errada" }),
    ).rejects.toThrow(CredenciaisInvalidasError);
  });
});

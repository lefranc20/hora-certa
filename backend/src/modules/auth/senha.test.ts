import { describe, expect, it } from "vitest";
import { gerarHashSenha, verificarSenha } from "./senha.js";

describe("senha", () => {
  it("gera um hash que confere com a senha original", async () => {
    const hash = await gerarHashSenha("minhaSenha123");

    expect(await verificarSenha("minhaSenha123", hash)).toBe(true);
  });

  it("rejeita uma senha incorreta", async () => {
    const hash = await gerarHashSenha("minhaSenha123");

    expect(await verificarSenha("outraSenha", hash)).toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const hash1 = await gerarHashSenha("minhaSenha123");
    const hash2 = await gerarHashSenha("minhaSenha123");

    expect(hash1).not.toBe(hash2);
  });
});

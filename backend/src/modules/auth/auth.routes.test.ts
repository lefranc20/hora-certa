import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { InMemoryUsuarioRepository } from "./usuario.repository.js";
import { createAuthRouter } from "./auth.routes.js";
import { gerarHashSenha } from "./senha.js";
import type { UsuarioComSenha } from "./auth.types.js";

async function criarAppDeTeste() {
  const admin: UsuarioComSenha = {
    id: "usuario-1",
    nome: "Admin",
    email: "admin@horacerta.dev",
    senhaHash: await gerarHashSenha("admin123"),
    papel: "ADMIN",
    profissionalId: null,
  };

  const app = express();
  app.use(express.json());
  app.use(createAuthRouter(new InMemoryUsuarioRepository([admin])));
  return app;
}

describe("POST /auth/login", () => {
  it("retorna 200 com token quando as credenciais estão corretas", async () => {
    const app = await criarAppDeTeste();

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "admin@horacerta.dev", senha: "admin123" });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.usuario.papel).toBe("ADMIN");
  });

  it("retorna 401 quando as credenciais estão erradas", async () => {
    const app = await criarAppDeTeste();

    const response = await request(app)
      .post("/auth/login")
      .send({ email: "admin@horacerta.dev", senha: "errada" });

    expect(response.status).toBe(401);
  });

  it("retorna 400 quando o corpo está incompleto", async () => {
    const app = await criarAppDeTeste();

    const response = await request(app).post("/auth/login").send({});

    expect(response.status).toBe(400);
  });
});

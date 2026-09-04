import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { autenticar, exigirPapel } from "./auth.middleware.js";
import { gerarToken } from "./token.js";

function criarAppDeTeste() {
  const app = express();
  app.get("/protegida", autenticar, exigirPapel("ADMIN"), (req, res) => {
    res.json({ usuario: req.usuario });
  });
  app.get(
    "/qualquer-papel",
    autenticar,
    exigirPapel("ADMIN", "PROFISSIONAL"),
    (_req, res) => res.json({ ok: true }),
  );
  return app;
}

const payloadAdmin = {
  sub: "usuario-1",
  nome: "Admin",
  email: "admin@horacerta.dev",
  papel: "ADMIN" as const,
  profissionalId: null,
};

const payloadProfissional = {
  sub: "usuario-2",
  nome: "Profissional",
  email: "prof@horacerta.dev",
  papel: "PROFISSIONAL" as const,
  profissionalId: "prof-1",
};

describe("autenticar / exigirPapel", () => {
  it("retorna 401 quando não há token", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).get("/protegida");

    expect(response.status).toBe(401);
  });

  it("retorna 401 quando o token é inválido", async () => {
    const app = criarAppDeTeste();

    const response = await request(app)
      .get("/protegida")
      .set("Authorization", "Bearer token-invalido");

    expect(response.status).toBe(401);
  });

  it("retorna 403 quando o papel não é permitido", async () => {
    const app = criarAppDeTeste();
    const token = gerarToken(payloadProfissional);

    const response = await request(app)
      .get("/protegida")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(403);
  });

  it("permite acesso e popula req.usuario quando o papel é permitido", async () => {
    const app = criarAppDeTeste();
    const token = gerarToken(payloadAdmin);

    const response = await request(app)
      .get("/protegida")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.usuario).toEqual({
      id: "usuario-1",
      nome: "Admin",
      email: "admin@horacerta.dev",
      papel: "ADMIN",
      profissionalId: null,
    });
  });

  it("aceita múltiplos papéis permitidos", async () => {
    const app = criarAppDeTeste();
    const token = gerarToken(payloadProfissional);

    const response = await request(app)
      .get("/qualquer-papel")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
});

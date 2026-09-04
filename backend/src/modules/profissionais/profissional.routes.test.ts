import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { gerarToken } from "../auth/token.js";
import { InMemoryProfissionalRepository } from "./profissional.repository.js";
import { createProfissionalRouter } from "./profissional.routes.js";
import type { Profissional } from "./profissional.types.js";

function criarAppDeTeste(iniciais: Profissional[] = []) {
  const app = express();
  app.use(express.json());
  app.use(createProfissionalRouter(new InMemoryProfissionalRepository(iniciais)));
  return app;
}

const tokenAdmin = gerarToken({
  sub: "usuario-admin",
  nome: "Admin",
  email: "admin@horacerta.dev",
  papel: "ADMIN",
  profissionalId: null,
});

const tokenProfissional = gerarToken({
  sub: "usuario-prof",
  nome: "Profissional",
  email: "prof@horacerta.dev",
  papel: "PROFISSIONAL",
  profissionalId: "prof-1",
});

const ATIVO: Profissional = { id: "1", nome: "Ana", ativo: true, criadoEm: new Date() };
const INATIVO: Profissional = {
  id: "2",
  nome: "Bruno",
  ativo: false,
  criadoEm: new Date(),
};

describe("GET /profissionais (público)", () => {
  it("retorna só os profissionais ativos", async () => {
    const app = criarAppDeTeste([ATIVO, INATIVO]);

    const response = await request(app).get("/profissionais");

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].nome).toBe("Ana");
  });
});

describe("GET /profissionais/todos (admin)", () => {
  it("exige ADMIN", async () => {
    const app = criarAppDeTeste([ATIVO, INATIVO]);

    const semToken = await request(app).get("/profissionais/todos");
    expect(semToken.status).toBe(401);

    const comProfissional = await request(app)
      .get("/profissionais/todos")
      .set("Authorization", `Bearer ${tokenProfissional}`);
    expect(comProfissional.status).toBe(403);
  });

  it("retorna todos, incluindo inativos, para ADMIN", async () => {
    const app = criarAppDeTeste([ATIVO, INATIVO]);

    const response = await request(app)
      .get("/profissionais/todos")
      .set("Authorization", `Bearer ${tokenAdmin}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe("POST /profissionais", () => {
  it("retorna 401 sem token", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).post("/profissionais").send({ nome: "Ana" });

    expect(response.status).toBe(401);
  });

  it("retorna 403 com token de profissional", async () => {
    const app = criarAppDeTeste();

    const response = await request(app)
      .post("/profissionais")
      .set("Authorization", `Bearer ${tokenProfissional}`)
      .send({ nome: "Ana" });

    expect(response.status).toBe(403);
  });

  it("retorna 201 com token de admin", async () => {
    const app = criarAppDeTeste();

    const response = await request(app)
      .post("/profissionais")
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ nome: "Ana" });

    expect(response.status).toBe(201);
    expect(response.body.nome).toBe("Ana");
  });
});

describe("PATCH /profissionais/:id", () => {
  it("desativa um profissional como admin", async () => {
    const app = criarAppDeTeste([ATIVO]);

    const response = await request(app)
      .patch(`/profissionais/${ATIVO.id}`)
      .set("Authorization", `Bearer ${tokenAdmin}`)
      .send({ ativo: false });

    expect(response.status).toBe(200);
    expect(response.body.ativo).toBe(false);
  });
});

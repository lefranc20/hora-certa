import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { InMemoryAgendamentoRepository } from "./agendamento.repository.js";
import { createAgendamentoRouter } from "./agendamento.routes.js";

function criarAppDeTeste() {
  const app = express();
  app.use(express.json());
  app.use(createAgendamentoRouter(new InMemoryAgendamentoRepository()));
  return app;
}

describe("POST /agendamentos", () => {
  it("cria um agendamento e retorna 201", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: "2026-10-01T10:00:00",
      duracaoMinutos: 30,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it("retorna 400 e lista os campos quando faltam dados obrigatórios", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({ cliente: "Ana" });

    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/obrigatórios/i);
    expect(response.body.campos).toEqual(
      expect.arrayContaining(["servico", "inicio", "duracaoMinutos"]),
    );
  });

  it("retorna 409 ao tentar agendar em horário já ocupado", async () => {
    const app = criarAppDeTeste();

    await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: "2026-10-02T10:00:00",
      duracaoMinutos: 30,
    });

    const response = await request(app).post("/agendamentos").send({
      cliente: "Bruno",
      servico: "Barba",
      inicio: "2026-10-02T10:15:00",
      duracaoMinutos: 30,
    });

    expect(response.status).toBe(409);
  });
});

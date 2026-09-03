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

/** Um horário no futuro, para passar pela validação de "início no passado". */
function daquiAHoras(horas: number): string {
  return new Date(Date.now() + horas * 3_600_000).toISOString();
}

describe("POST /agendamentos", () => {
  it("cria um agendamento e retorna 201", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
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

  it("retorna 400 quando o início está no passado", async () => {
    const app = criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(-2),
      duracaoMinutos: 30,
    });

    expect(response.status).toBe(400);
    expect(response.body.erro).toMatch(/futuro/i);
    expect(response.body.campos).toEqual(["inicio"]);
  });

  it("retorna 409 ao tentar agendar em horário já ocupado", async () => {
    const app = criarAppDeTeste();
    const inicio = daquiAHoras(48);

    await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio,
      duracaoMinutos: 30,
    });

    const conflitante = new Date(
      new Date(inicio).getTime() + 15 * 60_000,
    ).toISOString();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Bruno",
      servico: "Barba",
      inicio: conflitante,
      duracaoMinutos: 30,
    });

    expect(response.status).toBe(409);
  });
});

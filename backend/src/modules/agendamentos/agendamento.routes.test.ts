import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../app.js";

describe("POST /agendamentos", () => {
  it("cria um agendamento e retorna 201", async () => {
    const response = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: "2026-10-01T10:00:00",
      duracaoMinutos: 30,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it("retorna 409 ao tentar agendar em horário já ocupado", async () => {
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

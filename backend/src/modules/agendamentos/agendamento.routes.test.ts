import express from "express";
import { describe, expect, it } from "vitest";
import request from "supertest";
import { gerarToken } from "../auth/token.js";
import { InMemoryProfissionalRepository } from "../profissionais/profissional.repository.js";
import { InMemoryAgendamentoRepository } from "./agendamento.repository.js";
import { createAgendamentoRouter } from "./agendamento.routes.js";

async function criarAppDeTeste() {
  const profissionais = new InMemoryProfissionalRepository();
  const ana = await profissionais.criar({ nome: "Ana" });
  const bruno = await profissionais.criar({ nome: "Bruno" });

  const app = express();
  app.use(express.json());
  app.use(createAgendamentoRouter(new InMemoryAgendamentoRepository(), profissionais));

  return { app, anaId: ana.id, brunoId: bruno.id };
}

/** Um horário no futuro, para passar pela validação de "início no passado". */
function daquiAHoras(horas: number): string {
  return new Date(Date.now() + horas * 3_600_000).toISOString();
}

function tokenPara(papel: "ADMIN" | "PROFISSIONAL", profissionalId: string | null) {
  return gerarToken({
    sub: "usuario-1",
    nome: "Usuário",
    email: "usuario@horacerta.dev",
    papel,
    profissionalId,
  });
}

describe("POST /agendamentos", () => {
  it("cria um agendamento e retorna 201", async () => {
    const { app, anaId } = await criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it("retorna 400 e lista os campos quando faltam dados obrigatórios, incluindo profissionalId", async () => {
    const { app } = await criarAppDeTeste();

    const response = await request(app).post("/agendamentos").send({ cliente: "Ana" });

    expect(response.status).toBe(400);
    expect(response.body.campos).toEqual(
      expect.arrayContaining(["servico", "inicio", "duracaoMinutos", "profissionalId"]),
    );
  });

  it("retorna 409 ao tentar agendar em horário já ocupado com o mesmo profissional", async () => {
    const { app, anaId } = await criarAppDeTeste();
    const inicio = daquiAHoras(48);

    await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio,
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const conflitante = new Date(new Date(inicio).getTime() + 15 * 60_000).toISOString();

    const response = await request(app).post("/agendamentos").send({
      cliente: "Bruno",
      servico: "Barba",
      inicio: conflitante,
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    expect(response.status).toBe(409);
  });

  it("permite o mesmo horário para profissionais diferentes", async () => {
    const { app, anaId, brunoId } = await criarAppDeTeste();
    const inicio = daquiAHoras(72);

    await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio,
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const response = await request(app).post("/agendamentos").send({
      cliente: "Bruno",
      servico: "Barba",
      inicio,
      duracaoMinutos: 30,
      profissionalId: brunoId,
    });

    expect(response.status).toBe(201);
  });
});

describe("GET /agendamentos (público)", () => {
  it("exige o query param profissionalId", async () => {
    const { app } = await criarAppDeTeste();

    const response = await request(app).get("/agendamentos");

    expect(response.status).toBe(400);
  });

  it("lista só os agendamentos do profissional informado", async () => {
    const { app, anaId, brunoId } = await criarAppDeTeste();

    await request(app).post("/agendamentos").send({
      cliente: "Cliente Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });
    await request(app).post("/agendamentos").send({
      cliente: "Cliente Bruno",
      servico: "Barba",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: brunoId,
    });

    const response = await request(app).get(`/agendamentos?profissionalId=${anaId}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].cliente).toBe("Cliente Ana");
  });
});

describe("GET /agendamentos/todos (admin)", () => {
  it("exige ADMIN e mostra todos os profissionais, incluindo cancelados", async () => {
    const { app, anaId, brunoId } = await criarAppDeTeste();

    const semToken = await request(app).get("/agendamentos/todos");
    expect(semToken.status).toBe(401);

    await request(app).post("/agendamentos").send({
      cliente: "Cliente Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });
    const criado = await request(app).post("/agendamentos").send({
      cliente: "Cliente Bruno",
      servico: "Barba",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: brunoId,
    });

    await request(app)
      .patch(`/agendamentos/${criado.body.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenPara("ADMIN", null)}`)
      .send({});

    const response = await request(app)
      .get("/agendamentos/todos")
      .set("Authorization", `Bearer ${tokenPara("ADMIN", null)}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(2);
  });
});

describe("GET /agendamentos/minha-agenda (profissional)", () => {
  it("exige PROFISSIONAL e só retorna os agendamentos do próprio profissional", async () => {
    const { app, anaId, brunoId } = await criarAppDeTeste();

    await request(app).post("/agendamentos").send({
      cliente: "Cliente Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });
    await request(app).post("/agendamentos").send({
      cliente: "Cliente Bruno",
      servico: "Barba",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: brunoId,
    });

    const response = await request(app)
      .get("/agendamentos/minha-agenda")
      .set("Authorization", `Bearer ${tokenPara("PROFISSIONAL", anaId)}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].cliente).toBe("Cliente Ana");
  });
});

describe("PATCH /agendamentos/:id/cancelar", () => {
  it("retorna 400 quando PROFISSIONAL cancela sem observação", async () => {
    const { app, anaId } = await criarAppDeTeste();

    const criado = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const response = await request(app)
      .patch(`/agendamentos/${criado.body.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenPara("PROFISSIONAL", anaId)}`)
      .send({});

    expect(response.status).toBe(400);
  });

  it("retorna 200 quando ADMIN cancela sem observação", async () => {
    const { app, anaId } = await criarAppDeTeste();

    const criado = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const response = await request(app)
      .patch(`/agendamentos/${criado.body.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenPara("ADMIN", null)}`)
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.canceladoEm).not.toBeNull();
  });

  it("retorna 403 quando PROFISSIONAL tenta cancelar agendamento de outro", async () => {
    const { app, anaId, brunoId } = await criarAppDeTeste();

    const criado = await request(app).post("/agendamentos").send({
      cliente: "Ana",
      servico: "Corte",
      inicio: daquiAHoras(24),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const response = await request(app)
      .patch(`/agendamentos/${criado.body.id}/cancelar`)
      .set("Authorization", `Bearer ${tokenPara("PROFISSIONAL", brunoId)}`)
      .send({ observacao: "Motivo" });

    expect(response.status).toBe(403);
  });
});

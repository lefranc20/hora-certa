import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { PrismaAgendamentoRepository } from "./agendamento.repository.prisma.js";

const repository = new PrismaAgendamentoRepository();

beforeEach(async () => {
  await prisma.agendamento.deleteMany();
});

afterAll(async () => {
  await prisma.agendamento.deleteMany();
  await prisma.$disconnect();
});

describe("PrismaAgendamentoRepository", () => {
  it("salva e lista agendamentos no banco", async () => {
    await repository.salvar({
      id: randomUUID(),
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-11-01T10:00:00"),
      fim: new Date("2026-11-01T10:30:00"),
    });

    const agendamentos = await repository.listar();

    expect(agendamentos).toHaveLength(1);
    expect(agendamentos[0]?.cliente).toBe("Ana");
  });

  it("detecta conflito de horário consultando o banco", async () => {
    await repository.salvar({
      id: randomUUID(),
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-11-02T10:00:00"),
      fim: new Date("2026-11-02T10:30:00"),
    });

    const conflito = await repository.existeConflito(
      new Date("2026-11-02T10:15:00"),
      new Date("2026-11-02T10:45:00"),
    );
    const semConflito = await repository.existeConflito(
      new Date("2026-11-02T11:00:00"),
      new Date("2026-11-02T11:30:00"),
    );

    expect(conflito).toBe(true);
    expect(semConflito).toBe(false);
  });
});

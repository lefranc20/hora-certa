import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { PrismaAgendamentoRepository } from "./agendamento.repository.prisma.js";

const repository = new PrismaAgendamentoRepository();
let anaId: string;
let brunoId: string;

async function limpar() {
  await prisma.agendamento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.profissional.deleteMany();
}

beforeEach(async () => {
  await limpar();
  const ana = await prisma.profissional.create({ data: { nome: "Ana" } });
  const bruno = await prisma.profissional.create({ data: { nome: "Bruno" } });
  anaId = ana.id;
  brunoId = bruno.id;
});

afterAll(async () => {
  await limpar();
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
      profissionalId: anaId,
      canceladoEm: null,
      observacaoCancelamento: null,
    });

    const agendamentos = await repository.listar({ profissionalId: anaId });

    expect(agendamentos).toHaveLength(1);
    expect(agendamentos[0]?.cliente).toBe("Ana");
  });

  it("detecta conflito de horário só para o mesmo profissional", async () => {
    await repository.salvar({
      id: randomUUID(),
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-11-02T10:00:00"),
      fim: new Date("2026-11-02T10:30:00"),
      profissionalId: anaId,
      canceladoEm: null,
      observacaoCancelamento: null,
    });

    const conflitoMesmoProfissional = await repository.existeConflito(
      anaId,
      new Date("2026-11-02T10:15:00"),
      new Date("2026-11-02T10:45:00"),
    );
    const semConflitoOutroHorario = await repository.existeConflito(
      anaId,
      new Date("2026-11-02T11:00:00"),
      new Date("2026-11-02T11:30:00"),
    );
    const semConflitoOutroProfissional = await repository.existeConflito(
      brunoId,
      new Date("2026-11-02T10:15:00"),
      new Date("2026-11-02T10:45:00"),
    );

    expect(conflitoMesmoProfissional).toBe(true);
    expect(semConflitoOutroHorario).toBe(false);
    expect(semConflitoOutroProfissional).toBe(false);
  });

  it("cancelar grava canceladoEm/observacaoCancelamento e libera o horário", async () => {
    const id = randomUUID();
    await repository.salvar({
      id,
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-11-03T10:00:00"),
      fim: new Date("2026-11-03T10:30:00"),
      profissionalId: anaId,
      canceladoEm: null,
      observacaoCancelamento: null,
    });

    const cancelado = await repository.cancelar(id, {
      canceladoEm: new Date("2026-11-03T09:00:00"),
      observacaoCancelamento: "Cliente remarcou",
    });

    expect(cancelado?.observacaoCancelamento).toBe("Cliente remarcou");

    const aindaConflita = await repository.existeConflito(
      anaId,
      new Date("2026-11-03T10:00:00"),
      new Date("2026-11-03T10:30:00"),
    );
    expect(aindaConflita).toBe(false);
  });
});

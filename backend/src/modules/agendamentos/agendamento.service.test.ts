import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryAgendamentoRepository } from "./agendamento.repository.js";
import { AgendamentoService, ConflitoDeHorarioError } from "./agendamento.service.js";

describe("AgendamentoService", () => {
  let service: AgendamentoService;

  beforeEach(() => {
    service = new AgendamentoService(new InMemoryAgendamentoRepository());
  });

  it("cria um agendamento em horário livre", async () => {
    const agendamento = await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    expect(agendamento.id).toBeDefined();
    expect(await service.listar()).toHaveLength(1);
  });

  it("recusa agendamento com horário conflitante", async () => {
    await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    await expect(
      service.criar({
        cliente: "Bruno",
        servico: "Barba",
        inicio: new Date("2026-09-01T10:15:00"),
        duracaoMinutos: 30,
      }),
    ).rejects.toThrow(ConflitoDeHorarioError);
  });

  it("permite agendamento logo após o término do anterior", async () => {
    await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    const segundo = await service.criar({
      cliente: "Bruno",
      servico: "Barba",
      inicio: new Date("2026-09-01T10:30:00"),
      duracaoMinutos: 30,
    });

    expect(segundo.id).toBeDefined();
  });
});

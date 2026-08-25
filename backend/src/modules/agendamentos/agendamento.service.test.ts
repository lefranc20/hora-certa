import { beforeEach, describe, expect, it } from "vitest";
import { AgendamentoRepository } from "./agendamento.repository.js";
import { AgendamentoService, ConflitoDeHorarioError } from "./agendamento.service.js";

describe("AgendamentoService", () => {
  let service: AgendamentoService;

  beforeEach(() => {
    service = new AgendamentoService(new AgendamentoRepository());
  });

  it("cria um agendamento em horário livre", () => {
    const agendamento = service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    expect(agendamento.id).toBeDefined();
    expect(service.listar()).toHaveLength(1);
  });

  it("recusa agendamento com horário conflitante", () => {
    service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    expect(() =>
      service.criar({
        cliente: "Bruno",
        servico: "Barba",
        inicio: new Date("2026-09-01T10:15:00"),
        duracaoMinutos: 30,
      }),
    ).toThrow(ConflitoDeHorarioError);
  });

  it("permite agendamento logo após o término do anterior", () => {
    service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
    });

    const segundo = service.criar({
      cliente: "Bruno",
      servico: "Barba",
      inicio: new Date("2026-09-01T10:30:00"),
      duracaoMinutos: 30,
    });

    expect(segundo.id).toBeDefined();
  });
});

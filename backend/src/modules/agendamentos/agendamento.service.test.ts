import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProfissionalRepository } from "../profissionais/profissional.repository.js";
import { InMemoryAgendamentoRepository } from "./agendamento.repository.js";
import {
  AcessoNegadoError,
  AgendamentoJaCanceladoError,
  AgendamentoNaoEncontradoError,
  AgendamentoService,
  ConflitoDeHorarioError,
  ProfissionalInvalidoError,
} from "./agendamento.service.js";

describe("AgendamentoService", () => {
  let service: AgendamentoService;
  let profissionais: InMemoryProfissionalRepository;
  let anaId: string;
  let brunoId: string;

  beforeEach(async () => {
    profissionais = new InMemoryProfissionalRepository();
    const ana = await profissionais.criar({ nome: "Ana" });
    const bruno = await profissionais.criar({ nome: "Bruno" });
    anaId = ana.id;
    brunoId = bruno.id;
    service = new AgendamentoService(new InMemoryAgendamentoRepository(), profissionais);
  });

  it("cria um agendamento em horário livre", async () => {
    const agendamento = await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    expect(agendamento.id).toBeDefined();
    expect(await service.listar({ profissionalId: anaId })).toHaveLength(1);
  });

  it("recusa agendamento com horário conflitante para o mesmo profissional", async () => {
    await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    await expect(
      service.criar({
        cliente: "Bruno",
        servico: "Barba",
        inicio: new Date("2026-09-01T10:15:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      }),
    ).rejects.toThrow(ConflitoDeHorarioError);
  });

  it("permite dois profissionais diferentes terem o mesmo horário", async () => {
    await service.criar({
      cliente: "Ana Cliente",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const segundo = await service.criar({
      cliente: "Bruno Cliente",
      servico: "Barba",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
      profissionalId: brunoId,
    });

    expect(segundo.id).toBeDefined();
  });

  it("permite agendamento logo após o término do anterior", async () => {
    await service.criar({
      cliente: "Ana",
      servico: "Corte",
      inicio: new Date("2026-09-01T10:00:00"),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    const segundo = await service.criar({
      cliente: "Bruno",
      servico: "Barba",
      inicio: new Date("2026-09-01T10:30:00"),
      duracaoMinutos: 30,
      profissionalId: anaId,
    });

    expect(segundo.id).toBeDefined();
  });

  it("recusa profissional inexistente", async () => {
    await expect(
      service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: "id-fantasma",
      }),
    ).rejects.toThrow(ProfissionalInvalidoError);
  });

  it("recusa profissional inativo", async () => {
    await profissionais.atualizar(anaId, { ativo: false });

    await expect(
      service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      }),
    ).rejects.toThrow(ProfissionalInvalidoError);
  });

  describe("cancelar", () => {
    it("ADMIN cancela qualquer agendamento sem observação", async () => {
      const agendamento = await service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });

      const cancelado = await service.cancelar(
        agendamento.id,
        { papel: "ADMIN", profissionalId: null },
        null,
      );

      expect(cancelado.canceladoEm).not.toBeNull();
    });

    it("PROFISSIONAL cancela o próprio agendamento com observação", async () => {
      const agendamento = await service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });

      const cancelado = await service.cancelar(
        agendamento.id,
        { papel: "PROFISSIONAL", profissionalId: anaId },
        "Cliente remarcou",
      );

      expect(cancelado.observacaoCancelamento).toBe("Cliente remarcou");
    });

    it("PROFISSIONAL não pode cancelar agendamento de outro profissional", async () => {
      const agendamento = await service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });

      await expect(
        service.cancelar(
          agendamento.id,
          { papel: "PROFISSIONAL", profissionalId: brunoId },
          "Motivo",
        ),
      ).rejects.toThrow(AcessoNegadoError);
    });

    it("lança erro ao cancelar agendamento inexistente", async () => {
      await expect(
        service.cancelar("id-fantasma", { papel: "ADMIN", profissionalId: null }, null),
      ).rejects.toThrow(AgendamentoNaoEncontradoError);
    });

    it("lança erro ao cancelar um agendamento já cancelado", async () => {
      const agendamento = await service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });
      await service.cancelar(agendamento.id, { papel: "ADMIN", profissionalId: null }, null);

      await expect(
        service.cancelar(agendamento.id, { papel: "ADMIN", profissionalId: null }, null),
      ).rejects.toThrow(AgendamentoJaCanceladoError);
    });

    it("libera o horário depois de cancelado", async () => {
      const agendamento = await service.criar({
        cliente: "Ana",
        servico: "Corte",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });
      await service.cancelar(agendamento.id, { papel: "ADMIN", profissionalId: null }, null);

      const novo = await service.criar({
        cliente: "Bruno",
        servico: "Barba",
        inicio: new Date("2026-09-01T10:00:00"),
        duracaoMinutos: 30,
        profissionalId: anaId,
      });

      expect(novo.id).toBeDefined();
    });
  });
});

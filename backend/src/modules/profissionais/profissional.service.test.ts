import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryProfissionalRepository } from "./profissional.repository.js";
import {
  ProfissionalNaoEncontradoError,
  ProfissionalService,
} from "./profissional.service.js";

describe("ProfissionalService", () => {
  let service: ProfissionalService;

  beforeEach(() => {
    service = new ProfissionalService(new InMemoryProfissionalRepository());
  });

  it("cria um profissional ativo por padrão", async () => {
    const profissional = await service.criar({ nome: "Ana Souza" });

    expect(profissional.ativo).toBe(true);
  });

  it("listarAtivos ignora profissionais inativos", async () => {
    const ana = await service.criar({ nome: "Ana Souza" });
    await service.criar({ nome: "Bruno Lima" });
    await service.atualizar(ana.id, { ativo: false });

    const ativos = await service.listarAtivos();

    expect(ativos).toHaveLength(1);
    expect(ativos[0]?.nome).toBe("Bruno Lima");
  });

  it("listarTodos inclui inativos", async () => {
    const ana = await service.criar({ nome: "Ana Souza" });
    await service.atualizar(ana.id, { ativo: false });

    expect(await service.listarTodos()).toHaveLength(1);
  });

  it("desativar marca ativo como false", async () => {
    const ana = await service.criar({ nome: "Ana Souza" });

    const atualizado = await service.desativar(ana.id);

    expect(atualizado.ativo).toBe(false);
  });

  it("lança erro ao atualizar id inexistente", async () => {
    await expect(service.atualizar("id-fantasma", { nome: "X" })).rejects.toThrow(
      ProfissionalNaoEncontradoError,
    );
  });
});

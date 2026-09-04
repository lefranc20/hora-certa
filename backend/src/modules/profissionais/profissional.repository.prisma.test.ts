import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../../lib/prisma.js";
import { PrismaProfissionalRepository } from "./profissional.repository.prisma.js";

const repository = new PrismaProfissionalRepository();

async function limpar() {
  await prisma.agendamento.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.profissional.deleteMany();
}

beforeEach(limpar);

afterAll(async () => {
  await limpar();
  await prisma.$disconnect();
});

describe("PrismaProfissionalRepository", () => {
  it("cria e busca um profissional por id", async () => {
    const criado = await repository.criar({ nome: "Ana Souza" });

    const encontrado = await repository.buscarPorId(criado.id);

    expect(encontrado?.nome).toBe("Ana Souza");
    expect(encontrado?.ativo).toBe(true);
  });

  it("listar com apenasAtivos filtra os inativos no banco", async () => {
    const ana = await repository.criar({ nome: "Ana Souza" });
    await repository.criar({ nome: "Bruno Lima" });
    await repository.atualizar(ana.id, { ativo: false });

    const ativos = await repository.listar({ apenasAtivos: true });
    const todos = await repository.listar();

    expect(ativos).toHaveLength(1);
    expect(ativos[0]?.nome).toBe("Bruno Lima");
    expect(todos).toHaveLength(2);
  });

  it("atualizar em id inexistente devolve null", async () => {
    expect(await repository.atualizar("id-fantasma", { nome: "X" })).toBeNull();
  });
});

import type { ProfissionalRepository } from "./profissional.repository.js";
import type { Profissional } from "./profissional.types.js";

export class ProfissionalNaoEncontradoError extends Error {
  constructor() {
    super("Profissional não encontrado.");
    this.name = "ProfissionalNaoEncontradoError";
  }
}

export class ProfissionalService {
  constructor(private readonly repository: ProfissionalRepository) {}

  async criar(dados: { nome: string }): Promise<Profissional> {
    return this.repository.criar(dados);
  }

  async listarAtivos(): Promise<Profissional[]> {
    return this.repository.listar({ apenasAtivos: true });
  }

  async listarTodos(): Promise<Profissional[]> {
    return this.repository.listar();
  }

  async atualizar(
    id: string,
    dados: Partial<{ nome: string; ativo: boolean }>,
  ): Promise<Profissional> {
    const atualizado = await this.repository.atualizar(id, dados);
    if (!atualizado) {
      throw new ProfissionalNaoEncontradoError();
    }
    return atualizado;
  }

  async desativar(id: string): Promise<Profissional> {
    return this.atualizar(id, { ativo: false });
  }
}

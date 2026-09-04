import { randomUUID } from "node:crypto";
import type { Profissional } from "./profissional.types.js";

export interface ProfissionalRepository {
  listar(opts?: { apenasAtivos?: boolean }): Promise<Profissional[]>;
  buscarPorId(id: string): Promise<Profissional | null>;
  criar(dados: { nome: string }): Promise<Profissional>;
  atualizar(
    id: string,
    dados: Partial<{ nome: string; ativo: boolean }>,
  ): Promise<Profissional | null>;
}

export class InMemoryProfissionalRepository implements ProfissionalRepository {
  private profissionais: Profissional[] = [];

  constructor(iniciais: Profissional[] = []) {
    this.profissionais = iniciais;
  }

  async listar(opts?: { apenasAtivos?: boolean }): Promise<Profissional[]> {
    if (opts?.apenasAtivos) {
      return this.profissionais.filter((p) => p.ativo);
    }
    return this.profissionais;
  }

  async buscarPorId(id: string): Promise<Profissional | null> {
    return this.profissionais.find((p) => p.id === id) ?? null;
  }

  async criar(dados: { nome: string }): Promise<Profissional> {
    const profissional: Profissional = {
      id: randomUUID(),
      nome: dados.nome,
      ativo: true,
      criadoEm: new Date(),
    };
    this.profissionais.push(profissional);
    return profissional;
  }

  async atualizar(
    id: string,
    dados: Partial<{ nome: string; ativo: boolean }>,
  ): Promise<Profissional | null> {
    const profissional = this.profissionais.find((p) => p.id === id);
    if (!profissional) return null;

    Object.assign(profissional, dados);
    return profissional;
  }
}

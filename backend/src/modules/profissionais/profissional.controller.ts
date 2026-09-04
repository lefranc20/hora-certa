import type { Request, Response } from "express";
import {
  ProfissionalService,
  ProfissionalNaoEncontradoError,
} from "./profissional.service.js";
import {
  validarAtualizacaoProfissional,
  validarEntradaProfissional,
} from "./profissional.validation.js";

export class ProfissionalController {
  constructor(private readonly service: ProfissionalService) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const validacao = validarEntradaProfissional(req.body);

    if (!validacao.ok) {
      res.status(400).json({ erro: validacao.mensagem });
      return;
    }

    const profissional = await this.service.criar(validacao.dados);
    res.status(201).json(profissional);
  };

  listarAtivos = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listarAtivos());
  };

  listarTodos = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listarTodos());
  };

  atualizar = async (req: Request, res: Response): Promise<void> => {
    const validacao = validarAtualizacaoProfissional(req.body);

    if (!validacao.ok) {
      res.status(400).json({ erro: validacao.mensagem });
      return;
    }

    try {
      const profissional = await this.service.atualizar(
        req.params.id as string,
        validacao.dados,
      );
      res.json(profissional);
    } catch (error) {
      if (error instanceof ProfissionalNaoEncontradoError) {
        res.status(404).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };

  remover = async (req: Request, res: Response): Promise<void> => {
    try {
      const profissional = await this.service.desativar(req.params.id as string);
      res.json(profissional);
    } catch (error) {
      if (error instanceof ProfissionalNaoEncontradoError) {
        res.status(404).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };
}

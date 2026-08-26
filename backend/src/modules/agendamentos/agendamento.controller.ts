import type { Request, Response } from "express";
import { AgendamentoService, ConflitoDeHorarioError } from "./agendamento.service.js";

export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const { cliente, servico, inicio, duracaoMinutos } = req.body;

    try {
      const agendamento = await this.service.criar({
        cliente,
        servico,
        inicio: new Date(inicio),
        duracaoMinutos,
      });
      res.status(201).json(agendamento);
    } catch (error) {
      if (error instanceof ConflitoDeHorarioError) {
        res.status(409).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };

  listar = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listar());
  };
}

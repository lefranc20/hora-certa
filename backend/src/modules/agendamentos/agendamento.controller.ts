import type { Request, Response } from "express";
import { AgendamentoService, ConflitoDeHorarioError } from "./agendamento.service.js";

export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  criar = (req: Request, res: Response): void => {
    const { cliente, servico, inicio, duracaoMinutos } = req.body;

    try {
      const agendamento = this.service.criar({
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

  listar = (_req: Request, res: Response): void => {
    res.json(this.service.listar());
  };
}

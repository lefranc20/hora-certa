import type { Request, Response } from "express";
import { AgendamentoService, ConflitoDeHorarioError } from "./agendamento.service.js";
import { validarEntradaAgendamento } from "./agendamento.validation.js";

export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const validacao = validarEntradaAgendamento(req.body);

    if (!validacao.ok) {
      res.status(400).json({
        erro: "Todos os campos são obrigatórios para realizar o agendamento.",
        campos: validacao.camposInvalidos,
      });
      return;
    }

    try {
      const agendamento = await this.service.criar(validacao.dados);
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

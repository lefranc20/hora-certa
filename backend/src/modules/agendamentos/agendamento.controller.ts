import type { Request, Response } from "express";
import {
  AcessoNegadoError,
  AgendamentoJaCanceladoError,
  AgendamentoNaoEncontradoError,
  AgendamentoService,
  ConflitoDeHorarioError,
  ProfissionalInvalidoError,
} from "./agendamento.service.js";
import { validarCancelamento, validarEntradaAgendamento } from "./agendamento.validation.js";

export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  criar = async (req: Request, res: Response): Promise<void> => {
    const validacao = validarEntradaAgendamento(req.body);

    if (!validacao.ok) {
      res.status(400).json({
        erro: validacao.mensagem,
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
      if (error instanceof ProfissionalInvalidoError) {
        res.status(400).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };

  listarPublico = async (req: Request, res: Response): Promise<void> => {
    const profissionalId = typeof req.query.profissionalId === "string"
      ? req.query.profissionalId
      : "";

    if (!profissionalId) {
      res.status(400).json({ erro: "Informe o profissional (?profissionalId=)." });
      return;
    }

    res.json(await this.service.listar({ profissionalId }));
  };

  listarConsolidado = async (_req: Request, res: Response): Promise<void> => {
    res.json(await this.service.listar({ incluirCancelados: true }));
  };

  listarMinhaAgenda = async (req: Request, res: Response): Promise<void> => {
    res.json(
      await this.service.listar({
        profissionalId: req.usuario?.profissionalId ?? undefined,
        incluirCancelados: true,
      }),
    );
  };

  cancelar = async (req: Request, res: Response): Promise<void> => {
    const usuario = req.usuario;
    if (!usuario) {
      res.status(401).json({ erro: "Não autenticado." });
      return;
    }

    const validacao = validarCancelamento(req.body, usuario.papel);
    if (!validacao.ok) {
      res.status(400).json({ erro: validacao.mensagem });
      return;
    }

    try {
      const agendamento = await this.service.cancelar(
        req.params.id as string,
        { papel: usuario.papel, profissionalId: usuario.profissionalId },
        validacao.dados.observacao,
      );
      res.json(agendamento);
    } catch (error) {
      if (error instanceof AgendamentoNaoEncontradoError) {
        res.status(404).json({ erro: error.message });
        return;
      }
      if (error instanceof AgendamentoJaCanceladoError) {
        res.status(409).json({ erro: error.message });
        return;
      }
      if (error instanceof AcessoNegadoError) {
        res.status(403).json({ erro: error.message });
        return;
      }
      throw error;
    }
  };
}

import { Router } from "express";
import type { AgendamentoRepository } from "./agendamento.repository.js";
import { AgendamentoController } from "./agendamento.controller.js";
import { AgendamentoService } from "./agendamento.service.js";

export function createAgendamentoRouter(repository: AgendamentoRepository): Router {
  const service = new AgendamentoService(repository);
  const controller = new AgendamentoController(service);

  const router = Router();
  router.post("/agendamentos", controller.criar);
  router.get("/agendamentos", controller.listar);
  return router;
}

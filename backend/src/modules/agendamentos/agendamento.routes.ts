import { Router } from "express";
import { autenticar, exigirPapel } from "../auth/auth.middleware.js";
import type { ProfissionalRepository } from "../profissionais/profissional.repository.js";
import type { AgendamentoRepository } from "./agendamento.repository.js";
import { AgendamentoController } from "./agendamento.controller.js";
import { AgendamentoService } from "./agendamento.service.js";

export function createAgendamentoRouter(
  repository: AgendamentoRepository,
  profissionais: ProfissionalRepository,
): Router {
  const service = new AgendamentoService(repository, profissionais);
  const controller = new AgendamentoController(service);

  const router = Router();
  router.post("/agendamentos", controller.criar);
  router.get("/agendamentos", controller.listarPublico);
  router.get(
    "/agendamentos/todos",
    autenticar,
    exigirPapel("ADMIN"),
    controller.listarConsolidado,
  );
  router.get(
    "/agendamentos/minha-agenda",
    autenticar,
    exigirPapel("PROFISSIONAL"),
    controller.listarMinhaAgenda,
  );
  router.patch(
    "/agendamentos/:id/cancelar",
    autenticar,
    exigirPapel("ADMIN", "PROFISSIONAL"),
    controller.cancelar,
  );
  return router;
}

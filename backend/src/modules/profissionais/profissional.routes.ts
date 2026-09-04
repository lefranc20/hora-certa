import { Router } from "express";
import { autenticar, exigirPapel } from "../auth/auth.middleware.js";
import type { ProfissionalRepository } from "./profissional.repository.js";
import { ProfissionalController } from "./profissional.controller.js";
import { ProfissionalService } from "./profissional.service.js";

export function createProfissionalRouter(repository: ProfissionalRepository): Router {
  const service = new ProfissionalService(repository);
  const controller = new ProfissionalController(service);

  const router = Router();
  router.get("/profissionais", controller.listarAtivos);
  router.get("/profissionais/todos", autenticar, exigirPapel("ADMIN"), controller.listarTodos);
  router.post("/profissionais", autenticar, exigirPapel("ADMIN"), controller.criar);
  router.patch("/profissionais/:id", autenticar, exigirPapel("ADMIN"), controller.atualizar);
  router.delete("/profissionais/:id", autenticar, exigirPapel("ADMIN"), controller.remover);
  return router;
}

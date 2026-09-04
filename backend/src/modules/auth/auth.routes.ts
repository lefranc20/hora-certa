import { Router } from "express";
import type { UsuarioRepository } from "./usuario.repository.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";

export function createAuthRouter(repository: UsuarioRepository): Router {
  const service = new AuthService(repository);
  const controller = new AuthController(service);

  const router = Router();
  router.post("/auth/login", controller.login);
  return router;
}

import { Router } from "express";
import { AgendamentoRepository } from "./agendamento.repository.js";
import { AgendamentoController } from "./agendamento.controller.js";
import { AgendamentoService } from "./agendamento.service.js";

const service = new AgendamentoService(new AgendamentoRepository());
const controller = new AgendamentoController(service);

export const agendamentoRouter = Router();
agendamentoRouter.post("/agendamentos", controller.criar);
agendamentoRouter.get("/agendamentos", controller.listar);

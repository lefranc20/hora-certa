import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createAuthRouter } from "./modules/auth/auth.routes.js";
import { PrismaUsuarioRepository } from "./modules/auth/usuario.repository.prisma.js";
import { createProfissionalRouter } from "./modules/profissionais/profissional.routes.js";
import { PrismaProfissionalRepository } from "./modules/profissionais/profissional.repository.prisma.js";
import { createAgendamentoRouter } from "./modules/agendamentos/agendamento.routes.js";
import { PrismaAgendamentoRepository } from "./modules/agendamentos/agendamento.repository.prisma.js";

export const app = express();
const profissionalRepository = new PrismaProfissionalRepository();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(createAuthRouter(new PrismaUsuarioRepository()));
app.use(createProfissionalRouter(profissionalRepository));
app.use(
  createAgendamentoRouter(new PrismaAgendamentoRepository(), profissionalRepository),
);

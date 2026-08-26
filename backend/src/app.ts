import cors from "cors";
import express from "express";
import morgan from "morgan";
import { createAgendamentoRouter } from "./modules/agendamentos/agendamento.routes.js";
import { PrismaAgendamentoRepository } from "./modules/agendamentos/agendamento.repository.prisma.js";

export const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(createAgendamentoRouter(new PrismaAgendamentoRepository()));

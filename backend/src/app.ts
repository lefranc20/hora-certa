import cors from "cors";
import express from "express";
import morgan from "morgan";
import { agendamentoRouter } from "./modules/agendamentos/agendamento.routes.js";

export const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(agendamentoRouter);

import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import {
  type Agendamento,
  criarAgendamento,
  listarAgendamentos,
} from "./api/agendamentos";
import "./App.css";

function formatarHorario(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function App() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [cliente, setCliente] = useState("");
  const [servico, setServico] = useState("");
  const [inicio, setInicio] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState(30);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    listarAgendamentos().then(setAgendamentos).catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const novo = await criarAgendamento({
        cliente,
        servico,
        inicio,
        duracaoMinutos,
      });
      setAgendamentos((atuais) =>
        [...atuais, novo].sort((a, b) => a.inicio.localeCompare(b.inicio)),
      );
      setCliente("");
      setServico("");
      setInicio("");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErro(error.response.data.erro ?? "Horário já ocupado.");
      } else {
        setErro("Não foi possível criar o agendamento.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <header className="app-header">
        <h1>HoraCerta</h1>
        <p>Agende um horário e veja a agenda em tempo real.</p>
      </header>

      <form className="form-agendamento" onSubmit={handleSubmit}>
        <div className="linha">
          <label>
            Cliente
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              required
            />
          </label>
          <label>
            Serviço
            <input
              value={servico}
              onChange={(e) => setServico(e.target.value)}
              required
            />
          </label>
        </div>
        <div className="linha">
          <label>
            Início
            <input
              type="datetime-local"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
              required
            />
          </label>
          <label>
            Duração (min)
            <input
              type="number"
              min={5}
              step={5}
              value={duracaoMinutos}
              onChange={(e) => setDuracaoMinutos(Number(e.target.value))}
              required
            />
          </label>
        </div>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? "Agendando..." : "Agendar"}
        </button>
      </form>

      {agendamentos.length === 0 ? (
        <p className="vazio">Nenhum agendamento ainda.</p>
      ) : (
        <ul className="lista-agendamentos">
          {agendamentos.map((agendamento) => (
            <li key={agendamento.id}>
              <div>
                <div className="servico">
                  {agendamento.servico} — {agendamento.cliente}
                </div>
                <div className="horario">
                  {formatarHorario(agendamento.inicio)} até{" "}
                  {formatarHorario(agendamento.fim)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default App;

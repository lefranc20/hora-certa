import axios from "axios";
import { type FormEvent, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  type Agendamento,
  criarAgendamento,
  listarAgendamentos,
} from "../api/agendamentos";
import { listarProfissionaisAtivos, type Profissional } from "../api/profissionais";

function formatarPeriodo(inicioIso: string, fimIso: string): string {
  const inicio = new Date(inicioIso);
  const fim = new Date(fimIso);

  const dia = (d: Date) =>
    d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const hora = (d: Date) =>
    d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const fimFormatado =
    inicio.toDateString() === fim.toDateString()
      ? hora(fim)
      : `${dia(fim)}, ${hora(fim)}`;

  return `${dia(inicio)}, ${hora(inicio)} — ${fimFormatado}`;
}

type EstadoContador = "futuro" | "andamento" | "encerrado";

function tempoRelativo(
  inicio: string,
  fim: string,
  agora: number,
): { texto: string; estado: EstadoContador } {
  const inicioMs = new Date(inicio).getTime();
  const fimMs = new Date(fim).getTime();

  if (agora >= fimMs) return { texto: "encerrado", estado: "encerrado" };
  if (agora >= inicioMs) return { texto: "em andamento", estado: "andamento" };

  const minutos = Math.round((inicioMs - agora) / 60_000);
  if (minutos < 1) return { texto: "começa agora", estado: "futuro" };
  if (minutos < 60) return { texto: `começa em ${minutos} min`, estado: "futuro" };

  const horas = Math.floor(minutos / 60);
  if (horas < 24) {
    const resto = minutos % 60;
    return {
      texto: resto ? `começa em ${horas}h ${resto}min` : `começa em ${horas}h`,
      estado: "futuro",
    };
  }

  const dias = Math.floor(horas / 24);
  return {
    texto: `começa em ${dias} ${dias === 1 ? "dia" : "dias"}`,
    estado: "futuro",
  };
}

function PaginaPublica() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [profissionalId, setProfissionalId] = useState("");
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [cliente, setCliente] = useState("");
  const [servico, setServico] = useState("");
  const [inicio, setInicio] = useState("");
  const [duracaoMinutos, setDuracaoMinutos] = useState(30);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [agora, setAgora] = useState(() => Date.now());

  useEffect(() => {
    listarProfissionaisAtivos()
      .then((lista) => {
        setProfissionais(lista);
        if (lista.length > 0) setProfissionalId((atual) => atual || lista[0].id);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!profissionalId) {
      setAgendamentos([]);
      return;
    }
    listarAgendamentos(profissionalId).then(setAgendamentos).catch(console.error);
  }, [profissionalId]);

  useEffect(() => {
    const id = setInterval(() => setAgora(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  function validarFormulario(): string | null {
    if (!profissionalId) return "Escolha um profissional.";
    if (!cliente.trim()) return "Informe o nome do cliente.";
    if (!servico.trim()) return "Informe o serviço.";
    if (!inicio) return "Escolha o horário de início.";
    if (new Date(inicio).getTime() <= Date.now()) {
      return "O horário de início precisa ser no futuro.";
    }
    if (!Number.isFinite(duracaoMinutos) || duracaoMinutos < 5) {
      return "A duração deve ser de pelo menos 5 minutos.";
    }
    return null;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);

    const erroDeValidacao = validarFormulario();
    if (erroDeValidacao) {
      setErro(erroDeValidacao);
      return;
    }

    setEnviando(true);

    try {
      const novo = await criarAgendamento({
        cliente,
        servico,
        // datetime-local não tem fuso; o navegador converte para instante UTC
        inicio: new Date(inicio).toISOString(),
        duracaoMinutos,
        profissionalId,
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
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setErro(
          error.response.data.erro ??
            "Todos os campos são obrigatórios para realizar o agendamento.",
        );
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
        <div className="app-header-topo">
          <h1>HoraCerta</h1>
          <Link className="link-area-interna" to="/interna/entrar">
            Área Interna
          </Link>
        </div>
        <p>Agende um horário e veja a agenda em tempo real.</p>
      </header>

      <form className="form-agendamento" onSubmit={handleSubmit} noValidate>
        <label>
          Profissional
          <select
            value={profissionalId}
            onChange={(e) => setProfissionalId(e.target.value)}
            required
          >
            {profissionais.length === 0 && <option value="">Nenhum profissional disponível</option>}
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </label>
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
        <button type="submit" disabled={enviando || !profissionalId}>
          {enviando ? "Agendando..." : "Agendar"}
        </button>
      </form>

      {agendamentos.length === 0 ? (
        <p className="vazio">Nenhum agendamento ainda.</p>
      ) : (
        <ul className="lista-agendamentos">
          {agendamentos.map((agendamento) => {
            const contador = tempoRelativo(
              agendamento.inicio,
              agendamento.fim,
              agora,
            );
            return (
              <li key={agendamento.id}>
                <div>
                  <div className="servico">
                    {agendamento.servico} — {agendamento.cliente}
                  </div>
                  <div className="horario">
                    {formatarPeriodo(agendamento.inicio, agendamento.fim)}
                  </div>
                </div>
                <span className="contador" data-estado={contador.estado}>
                  {contador.texto}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

export default PaginaPublica;

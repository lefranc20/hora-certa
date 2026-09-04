import { useEffect, useState } from "react";
import {
  type Agendamento,
  cancelarAgendamento,
  listarMinhaAgenda,
} from "../api/agendamentos";
import { useAuth } from "../contexto/AuthContext";

function formatarPeriodo(inicioIso: string, fimIso: string): string {
  const inicio = new Date(inicioIso);
  const fim = new Date(fimIso);
  const dia = inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const horaInicio = inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const horaFim = fim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia}, ${horaInicio} — ${horaFim}`;
}

function PaginaAgendaProfissional() {
  const { usuario, sair } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    setCarregando(true);
    listarMinhaAgenda()
      .then(setAgendamentos)
      .catch(() => setErro("Não foi possível carregar sua agenda."))
      .finally(() => setCarregando(false));
  }

  useEffect(carregar, []);

  function abrirCancelamento(id: string) {
    setCancelandoId(id);
    setObservacao("");
    setErro(null);
  }

  async function confirmarCancelamento(id: string) {
    if (!observacao.trim()) {
      setErro("Informe uma observação para cancelar este agendamento.");
      return;
    }

    try {
      await cancelarAgendamento(id, observacao.trim());
      setCancelandoId(null);
      setErro(null);
      carregar();
    } catch {
      setErro("Não foi possível cancelar o agendamento.");
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="app-header-topo">
          <h1>Minha Agenda</h1>
          <button className="botao-sair" onClick={sair}>
            Sair
          </button>
        </div>
        <p>{usuario?.nome}</p>
      </header>

      {erro && <p className="erro">{erro}</p>}

      {carregando ? (
        <p className="vazio">Carregando...</p>
      ) : agendamentos.length === 0 ? (
        <p className="vazio">Nenhum agendamento na sua agenda.</p>
      ) : (
        <ul className="lista-agendamentos lista-interna">
          {agendamentos.map((agendamento) => (
            <li key={agendamento.id}>
              <div className="linha-topo">
                <div>
                  <div className="servico">
                    {agendamento.servico} — {agendamento.cliente}
                  </div>
                  <div className="horario">
                    {formatarPeriodo(agendamento.inicio, agendamento.fim)}
                  </div>
                </div>
                {agendamento.canceladoEm ? (
                  <span className="tag-cancelado">Cancelado</span>
                ) : cancelandoId === agendamento.id ? null : (
                  <button
                    className="botao-secundario"
                    onClick={() => abrirCancelamento(agendamento.id)}
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {agendamento.canceladoEm && agendamento.observacaoCancelamento && (
                <p className="observacao-cancelamento">
                  Motivo: {agendamento.observacaoCancelamento}
                </p>
              )}

              {cancelandoId === agendamento.id && (
                <div className="form-cancelamento">
                  <textarea
                    placeholder="Motivo do cancelamento (obrigatório)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                  <div className="linha-botoes">
                    <button onClick={() => confirmarCancelamento(agendamento.id)}>
                      Confirmar cancelamento
                    </button>
                    <button
                      className="botao-secundario"
                      onClick={() => setCancelandoId(null)}
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default PaginaAgendaProfissional;

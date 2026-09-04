import { type FormEvent, useEffect, useState } from "react";
import {
  type Agendamento,
  cancelarAgendamento,
  listarAgendaConsolidada,
} from "../api/agendamentos";
import {
  atualizarProfissional,
  criarProfissional,
  listarTodosProfissionais,
  type Profissional,
} from "../api/profissionais";
import { useAuth } from "../contexto/AuthContext";

function formatarPeriodo(inicioIso: string, fimIso: string): string {
  const inicio = new Date(inicioIso);
  const fim = new Date(fimIso);
  const dia = inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  const horaInicio = inicio.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const horaFim = fim.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${dia}, ${horaInicio} — ${horaFim}`;
}

function SecaoProfissionais() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [nome, setNome] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  function carregar() {
    listarTodosProfissionais().then(setProfissionais).catch(console.error);
  }

  useEffect(carregar, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!nome.trim()) {
      setErro("Informe o nome do profissional.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      await criarProfissional(nome.trim());
      setNome("");
      carregar();
    } catch {
      setErro("Não foi possível criar o profissional.");
    } finally {
      setEnviando(false);
    }
  }

  async function alternarAtivo(profissional: Profissional) {
    await atualizarProfissional(profissional.id, { ativo: !profissional.ativo });
    carregar();
  }

  return (
    <section>
      <h2>Profissionais</h2>

      <form className="form-profissional" onSubmit={handleSubmit} noValidate>
        <label>
          Nome
          <input value={nome} onChange={(e) => setNome(e.target.value)} required />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? "Criando..." : "Adicionar profissional"}
        </button>
      </form>

      <ul className="lista-profissionais">
        {profissionais.map((profissional) => (
          <li key={profissional.id}>
            <span>{profissional.nome}</span>
            <span className="linha-botoes">
              <span className={profissional.ativo ? "tag-ativo" : "tag-inativo"}>
                {profissional.ativo ? "Ativo" : "Inativo"}
              </span>
              <button className="botao-secundario" onClick={() => alternarAtivo(profissional)}>
                {profissional.ativo ? "Desativar" : "Reativar"}
              </button>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SecaoAgendaConsolidada() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [cancelandoId, setCancelandoId] = useState<string | null>(null);
  const [observacao, setObservacao] = useState("");

  function carregar() {
    listarAgendaConsolidada().then(setAgendamentos).catch(console.error);
  }

  useEffect(carregar, []);

  async function cancelar(id: string) {
    await cancelarAgendamento(id, observacao.trim() || undefined);
    setCancelandoId(null);
    setObservacao("");
    carregar();
  }

  return (
    <section>
      <h2>Agenda consolidada</h2>

      {agendamentos.length === 0 ? (
        <p className="vazio">Nenhum agendamento.</p>
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
                    {agendamento.profissional.nome} · {formatarPeriodo(agendamento.inicio, agendamento.fim)}
                  </div>
                </div>
                {agendamento.canceladoEm ? (
                  <span className="tag-cancelado">Cancelado</span>
                ) : cancelandoId === agendamento.id ? null : (
                  <button
                    className="botao-secundario"
                    onClick={() => {
                      setCancelandoId(agendamento.id);
                      setObservacao("");
                    }}
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
                    placeholder="Observação (opcional)"
                    value={observacao}
                    onChange={(e) => setObservacao(e.target.value)}
                  />
                  <div className="linha-botoes">
                    <button onClick={() => cancelar(agendamento.id)}>
                      Confirmar cancelamento
                    </button>
                    <button className="botao-secundario" onClick={() => setCancelandoId(null)}>
                      Voltar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function PaginaAdmin() {
  const { usuario, sair } = useAuth();

  return (
    <>
      <header className="app-header">
        <div className="app-header-topo">
          <h1>Área Interna — Admin</h1>
          <button className="botao-sair" onClick={sair}>
            Sair
          </button>
        </div>
        <p>{usuario?.nome}</p>
      </header>

      <SecaoProfissionais />
      <SecaoAgendaConsolidada />
    </>
  );
}

export default PaginaAdmin;

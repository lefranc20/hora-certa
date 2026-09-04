import axios from "axios";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

const USUARIOS_DE_TESTE = [
  { papel: "Admin", email: "admin@horacerta.dev", senha: "admin123" },
  { papel: "Profissional — Ana Souza", email: "profissional1@horacerta.dev", senha: "profissional123" },
  { papel: "Profissional — Bruno Lima", email: "profissional2@horacerta.dev", senha: "profissional123" },
  { papel: "Profissional — Carla Dias", email: "profissional3@horacerta.dev", senha: "profissional123" },
];

function PaginaLogin() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mostrarUsuarios, setMostrarUsuarios] = useState(false);

  if (usuario) {
    return (
      <Navigate to={usuario.papel === "ADMIN" ? "/interna/admin" : "/interna/agenda"} replace />
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const autenticado = await entrar(email, senha);
      navegar(autenticado.papel === "ADMIN" ? "/interna/admin" : "/interna/agenda");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErro("Email ou senha inválidos.");
      } else {
        setErro("Não foi possível entrar. Tente novamente.");
      }
    } finally {
      setEnviando(false);
    }
  }

  function usarUsuarioDeTeste(u: (typeof USUARIOS_DE_TESTE)[number]) {
    setEmail(u.email);
    setSenha(u.senha);
    setErro(null);
  }

  return (
    <>
      <header className="app-header">
        <h1>Área Interna</h1>
        <p>Entre com seu email e senha.</p>
      </header>

      <button
        type="button"
        className="aviso-badge"
        aria-expanded={mostrarUsuarios}
        onClick={() => setMostrarUsuarios((atual) => !atual)}
      >
        AVISO: Versão de testes — {mostrarUsuarios ? "ocultar usuários" : "ver usuários"}{" "}
        {mostrarUsuarios ? "▲" : "▼"}
      </button>

      {mostrarUsuarios && (
        <div className="aviso-caixa">
          <p>
            Esta é uma versão de demonstração do HoraCerta. Use uma das contas abaixo para
            entrar (clique na linha para preencher o formulário).
          </p>
          <table className="aviso-tabela">
            <thead>
              <tr>
                <th>Papel</th>
                <th>Email</th>
                <th>Senha</th>
              </tr>
            </thead>
            <tbody>
              {USUARIOS_DE_TESTE.map((u) => (
                <tr key={u.email} onClick={() => usarUsuarioDeTeste(u)}>
                  <td>{u.papel}</td>
                  <td>{u.email}</td>
                  <td>{u.senha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form className="form-login" onSubmit={handleSubmit} noValidate>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </label>
        {erro && <p className="erro">{erro}</p>}
        <button type="submit" disabled={enviando}>
          {enviando ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="vazio">
        <Link to="/">Voltar para o agendamento</Link>
      </p>
    </>
  );
}

export default PaginaLogin;

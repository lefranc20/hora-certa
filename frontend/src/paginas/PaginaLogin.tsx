import axios from "axios";
import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexto/AuthContext";

function PaginaLogin() {
  const { usuario, entrar } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

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

  return (
    <>
      <header className="app-header">
        <h1>Área Interna</h1>
        <p>Entre com seu email e senha.</p>
      </header>

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

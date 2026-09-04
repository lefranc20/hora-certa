import { Route, Routes } from "react-router-dom";
import { RotaProtegida } from "./componentes/RotaProtegida";
import PaginaAdmin from "./paginas/PaginaAdmin";
import PaginaAgendaProfissional from "./paginas/PaginaAgendaProfissional";
import PaginaLogin from "./paginas/PaginaLogin";
import PaginaPublica from "./paginas/PaginaPublica";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaPublica />} />
      <Route path="/interna/entrar" element={<PaginaLogin />} />
      <Route
        path="/interna/admin"
        element={
          <RotaProtegida papel="ADMIN">
            <PaginaAdmin />
          </RotaProtegida>
        }
      />
      <Route
        path="/interna/agenda"
        element={
          <RotaProtegida papel="PROFISSIONAL">
            <PaginaAgendaProfissional />
          </RotaProtegida>
        }
      />
    </Routes>
  );
}

export default App;

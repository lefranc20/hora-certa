-- Impede dois agendamentos ativos sobrepostos para o mesmo profissional.
-- Necessária para igualdade e sobreposição no mesmo índice GiST.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- '[)': quem termina 10:30 não conflita com quem começa 10:30.
ALTER TABLE "Agendamento"
  ADD CONSTRAINT "Agendamento_sem_sobreposicao"
  EXCLUDE USING gist (
    "profissionalId" WITH =,
    tsrange("inicio", "fim", '[)') WITH &&
  )
  WHERE ("canceladoEm" IS NULL);

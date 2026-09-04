-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('ADMIN', 'PROFISSIONAL');

-- CreateTable
CREATE TABLE "Profissional" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Profissional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "profissionalId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- AlterTable
-- profissionalId começa OPCIONAL de propósito: a tabela Agendamento pode já
-- ter linhas (ambientes com dados de teste), então populamos antes de tornar
-- a coluna obrigatória mais abaixo.
ALTER TABLE "Agendamento" ADD COLUMN     "canceladoEm" TIMESTAMP(3),
ADD COLUMN     "observacaoCancelamento" TEXT,
ADD COLUMN     "profissionalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_profissionalId_key" ON "Usuario"("profissionalId");

-- CreateIndex
CREATE INDEX "Agendamento_profissionalId_inicio_fim_idx" ON "Agendamento"("profissionalId", "inicio", "fim");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================
-- Backfill (escrito à mão, o Prisma não gera isso automaticamente):
-- só cria o profissional "guarda-chuva" SE houver algum Agendamento
-- pré-existente sem profissionalId (bancos com dados reais/de teste,
-- como o do deploy). Em bancos novos (CI, dev recém-criado) essa
-- condição é falsa e nenhum profissional fantasma é criado.
-- Idempotente: id fixo com ON CONFLICT DO NOTHING.
-- ============================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Agendamento" WHERE "profissionalId" IS NULL) THEN
    INSERT INTO "Profissional" ("id", "nome", "ativo", "criadoEm")
    VALUES ('00000000-0000-0000-0000-000000000001', 'Profissional Padrão (migração)', true, CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING;

    UPDATE "Agendamento"
    SET "profissionalId" = '00000000-0000-0000-0000-000000000001'
    WHERE "profissionalId" IS NULL;
  END IF;
END
$$;

ALTER TABLE "Agendamento" ALTER COLUMN "profissionalId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Profissional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

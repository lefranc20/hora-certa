-- CreateTable
CREATE TABLE "Agendamento" (
    "id" TEXT NOT NULL,
    "cliente" TEXT NOT NULL,
    "servico" TEXT NOT NULL,
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agendamento_pkey" PRIMARY KEY ("id")
);

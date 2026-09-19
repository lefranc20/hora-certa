# HoraCerta

Sistema de agendamento de horários (ex: barbearia/clínica/estúdio): cliente marca horário com um profissional, sistema impede conflitos, admin gerencia a agenda.

## Tecnologias

- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL
- **Testes:** Vitest, Supertest
- **Frontend:** React, TypeScript, Vite
- **CI:** GitHub Actions
- **Gerenciador de pacotes:** Yarn 4 (via Corepack)

## Como rodar

Requer Node.js com Corepack (já incluso no Node 20–24). Ative uma vez:

```bash
corepack enable
```

Backend e frontend são projetos independentes; rode os comandos dentro de cada pasta:

```bash
cd backend
cp .env.example .env   # preencha DATABASE_URL, DIRECT_URL e JWT_SECRET
yarn install
yarn prisma migrate deploy
yarn prisma db seed
yarn dev
```

```bash
cd frontend
yarn install
yarn dev
```
# HoraCerta

[![Backend CI](https://github.com/lefranc20/hora-certa/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/lefranc20/hora-certa/actions/workflows/backend-ci.yml) [![Frontend CI](https://github.com/lefranc20/hora-certa/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/lefranc20/hora-certa/actions/workflows/frontend-ci.yml)

Sistema de agendamento de horários (ex: barbearia/clínica/estúdio): cliente marca horário com um profissional, sistema impede conflitos, admin gerencia a agenda.

## Tecnologias

**Backend**

[![Node.js](https://img.shields.io/badge/Node.js-20-5FA04E?style=for-the-badge&logo=nodedotjs&logoColor=white&labelColor=5FA04E)](https://nodejs.org) [![TypeScript](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/typescript?filename=backend/package.json&label=TypeScript&color=3178C6&style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6)](https://www.typescriptlang.org) [![Express](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/express?filename=backend/package.json&label=Express&color=000000&style=for-the-badge&logo=express&logoColor=white&labelColor=000000)](https://expressjs.com) [![Prisma](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/prisma?filename=backend/package.json&label=Prisma&color=2D3748&style=for-the-badge&logo=prisma&logoColor=white&labelColor=2D3748)](https://www.prisma.io) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white&labelColor=4169E1)](https://www.postgresql.org)

**Testes**

[![Vitest](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/vitest?filename=backend/package.json&label=Vitest&color=6E9F18&style=for-the-badge&logo=vitest&logoColor=white&labelColor=6E9F18)](https://vitest.dev) [![Supertest](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/supertest?filename=backend/package.json&label=Supertest&color=07BA82&style=for-the-badge&labelColor=07BA82)](https://github.com/forwardemail/supertest)

**Frontend**

[![React](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/react?filename=frontend/package.json&label=React&color=20232A&style=for-the-badge&logo=react&logoColor=61DAFB&labelColor=20232A)](https://react.dev) [![TypeScript](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/typescript?filename=frontend/package.json&label=TypeScript&color=3178C6&style=for-the-badge&logo=typescript&logoColor=white&labelColor=3178C6)](https://www.typescriptlang.org) [![Vite](https://img.shields.io/github/package-json/dependency-version/lefranc20/hora-certa/dev/vite?filename=frontend/package.json&label=Vite&color=646CFF&style=for-the-badge&logo=vite&logoColor=white&labelColor=646CFF)](https://vite.dev)

**CI e ferramentas**

[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions) [![Yarn](https://img.shields.io/badge/Yarn_4-2C8EBF?style=for-the-badge&logo=yarn&logoColor=white)](https://yarnpkg.com)

## Como rodar

Requer Node.js com Corepack. Ativado uma vez com:

```bash
corepack enable
```

### Backend

```bash
cd backend
cp .env.example .env
yarn install
yarn prisma migrate deploy
yarn prisma db seed
yarn dev
```

### Frontend

```bash
cd frontend
yarn install
yarn dev
```
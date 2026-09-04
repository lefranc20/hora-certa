import "dotenv/config";
import { prisma } from "../src/lib/prisma.js";
import { gerarHashSenha } from "../src/modules/auth/senha.js";

const EMAIL_ADMIN = "admin@horacerta.dev";

async function main() {
  if (await prisma.usuario.findUnique({ where: { email: EMAIL_ADMIN } })) {
    console.log("Seed ignorado: usuário admin de demonstração já existe.");
    return;
  }

  const [ana, bruno, carla] = await Promise.all([
    prisma.profissional.create({ data: { nome: "Ana Souza" } }),
    prisma.profissional.create({ data: { nome: "Bruno Lima" } }),
    prisma.profissional.create({ data: { nome: "Carla Dias" } }),
  ]);

  await prisma.usuario.create({
    data: {
      nome: "Admin HoraCerta",
      email: EMAIL_ADMIN,
      senhaHash: await gerarHashSenha("admin123"),
      papel: "ADMIN",
    },
  });

  const senhaProfissional = await gerarHashSenha("profissional123");
  await Promise.all(
    [ana, bruno, carla].map((profissional, indice) =>
      prisma.usuario.create({
        data: {
          nome: profissional.nome,
          email: `profissional${indice + 1}@horacerta.dev`,
          senhaHash: senhaProfissional,
          papel: "PROFISSIONAL",
          profissionalId: profissional.id,
        },
      }),
    ),
  );

  const daquiA = (horas: number) => new Date(Date.now() + horas * 3_600_000);
  await prisma.agendamento.createMany({
    data: [
      {
        cliente: "Cliente Demo 1",
        servico: "Corte",
        profissionalId: ana.id,
        inicio: daquiA(24),
        fim: daquiA(24.5),
      },
      {
        cliente: "Cliente Demo 2",
        servico: "Barba",
        profissionalId: bruno.id,
        inicio: daquiA(30),
        fim: daquiA(30.5),
      },
      {
        cliente: "Cliente Demo 3",
        servico: "Coloração",
        profissionalId: carla.id,
        inicio: daquiA(48),
        fim: daquiA(49),
      },
    ],
  });

  console.log(
    "Seed concluído. Login de demo: admin@horacerta.dev / admin123 " +
      "e profissional1@horacerta.dev, profissional2@horacerta.dev, " +
      "profissional3@horacerta.dev / profissional123",
  );
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

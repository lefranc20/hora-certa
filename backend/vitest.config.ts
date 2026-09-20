import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Os testes de repositório compartilham um banco: em paralelo, a limpeza
    // de um arquivo apaga os dados do outro.
    fileParallelism: false,
  },
});

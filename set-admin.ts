import { PrismaClient } from "@prisma/client";

export {};

const prisma = new PrismaClient();

async function main() {
  const email = "lucianoxote@hotmail.com";
  try {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    console.log("\x1b[32m✅ SUCESSO: O usuário agora é ADMINISTRADOR!\x1b[0m");
  } catch (error) {
    console.error("\x1b[31m❌ ERRO: Usuário não encontrado no banco.\x1b[0m");
  } finally {
    await prisma.$disconnect();
  }
}

main();

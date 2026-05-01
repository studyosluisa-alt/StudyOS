const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const email = "lucianoxote@hotmail.com";
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" }
    });
    console.log(`\x1b[32m✅ SUCESSO: O usuário ${email} agora é ADMINISTRADOR!\x1b[0m`);
  } catch (error) {
    console.error(`\x1b[31m❌ ERRO: Usuário ${email} não encontrado. Certifique-se de que ele já se cadastrou no site primeiro.\x1b[0m`);
  } finally {
    await prisma.$disconnect();
  }
}

main();

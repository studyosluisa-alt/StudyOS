import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from "@prisma/adapter-libsql"

const dbPath = "file:C:/Users/Luciano Peixoto/Desktop/StudyOS/dev.db";
const adapter = new PrismaLibSql({ url: dbPath });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Tentando conectar ao banco...')
  try {
    const subjects = await prisma.subject.findMany()
    console.log('Conexão bem sucedida! Matérias encontradas:', subjects.length)
  } catch (e) {
    console.error('ERRO NA CONEXÃO:', e)
  } finally {
    await prisma.$disconnect()
  }
}

main()

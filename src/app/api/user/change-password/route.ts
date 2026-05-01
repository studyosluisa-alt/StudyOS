import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"
import { z } from "zod"

// Esquema de validação rigoroso
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z.string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres")
    .regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
    .regex(/[0-9]/, "A senha deve conter pelo menos um número")
    .regex(/[^A-Za-z0-9]/, "A senha deve conter pelo menos um caractere especial")
})

export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = await req.json()
    
    // 1. Validação de esquema (Zod)
    const validation = passwordSchema.safeParse(body)
    if (!validation.success) {
      const errorMessage = validation.error.errors[0].message
      return new NextResponse(errorMessage, { status: 400 })
    }

    const { currentPassword, newPassword } = validation.data

    // 2. Busca do usuário
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.password) {
      return new NextResponse("Usuário não encontrado", { status: 404 })
    }

    // 3. Validação da senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return new NextResponse("Senha atual incorreta", { status: 400 })
    }

    // 4. Verificação se a nova senha é igual à antiga (opcional mas recomendado)
    const isSamePassword = await bcrypt.compare(newPassword, user.password)
    if (isSamePassword) {
      return new NextResponse("A nova senha não pode ser igual à atual", { status: 400 })
    }

    // 5. Hash e Update
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return new NextResponse("Senha alterada com sucesso", { status: 200 })
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error)
    return new NextResponse("Erro interno do servidor", { status: 500 })
  }
}

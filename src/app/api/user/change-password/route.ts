import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.password) {
      return new NextResponse("Usuário não encontrado", { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return new NextResponse("Senha atual incorreta", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await db.user.update({
      where: { email: session.user.email },
      data: { password: hashedPassword }
    })

    return new NextResponse("Senha alterada com sucesso", { status: 200 })
  } catch (error) {
    console.error("[CHANGE_PASSWORD]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}

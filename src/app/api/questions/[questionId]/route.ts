import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const resolvedParams = await params
    const questionId = resolvedParams.questionId

    await prisma.question.delete({
      where: { id: questionId }
    })

    return NextResponse.json({ message: "Questão excluída com sucesso" })
  } catch (error) {
    console.error("[QUESTION_DELETE]", error)
    return NextResponse.json({ error: "Erro ao excluir questão" }, { status: 500 })
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const resolvedParams = await params
    const questionId = resolvedParams.questionId
    const body = await req.json()

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        content: body.content,
        optionA: body.optionA,
        optionB: body.optionB,
        optionC: body.optionC,
        optionD: body.optionD,
        optionE: body.optionE,
        correctOption: body.correctOption,
        explanation: body.explanation
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[QUESTION_UPDATE]", error)
    return NextResponse.json({ error: "Erro ao atualizar questão" }, { status: 500 })
  }
}

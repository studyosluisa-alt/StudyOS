import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { questionSchema } from "@/lib/validations/question"
import { z } from "zod"

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
    console.error("[QUESTION_DELETE]", error instanceof Error ? error.message : "Erro desconhecido")
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
    const parsedBody = questionSchema.parse(body)

    const updated = await prisma.question.update({
      where: { id: questionId },
      data: {
        content: parsedBody.content,
        optionA: parsedBody.optionA,
        optionB: parsedBody.optionB,
        optionC: parsedBody.optionC,
        optionD: parsedBody.optionD,
        optionE: parsedBody.optionE,
        correctOption: parsedBody.correctOption,
        explanation: parsedBody.explanation
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos: " + error.errors[0].message }, { status: 400 })
    }
    console.error("[QUESTION_UPDATE]", error instanceof Error ? error.message : "Erro desconhecido")
    return NextResponse.json({ error: "Erro ao atualizar questão" }, { status: 500 })
  }
}

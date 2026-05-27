import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { content, optionA, optionB, optionC, optionD, optionE, correctOption, explanation } = body;

    if (!content || !optionA || !optionB || !optionC || !correctOption) {
      console.error("[QUESTIONS_POST] Missing fields");
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const question = await prisma.question.create({
      data: {
        subjectId: id,
        content,
        optionA,
        optionB,
        optionC,
        optionD: optionD || null,
        optionE: optionE || null,
        correctOption,
        explanation: explanation || null,
      },
    });

    return NextResponse.json(question);
  } catch (error: any) {
    console.error("[QUESTIONS_POST] Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;

    // Verify ownership of the subject before deleting questions
    const subject = await prisma.subject.findFirst({
      where: { 
        id, 
        userId: session.user.id 
      }
    });

    if (!subject) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete all questions associated with this subject
    await prisma.question.deleteMany({
      where: { 
        subjectId: id 
      }
    });

    return NextResponse.json({ message: "Todas as questões foram excluídas com sucesso" });
  } catch (error: any) {
    console.error("[QUESTIONS_DELETE_MANY] Error:", error);
    return NextResponse.json({ error: error.message || "Erro interno" }, { status: 500 });
  }
}

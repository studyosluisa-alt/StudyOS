import { NextResponse } from "next/server";
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

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { question, answer } = body;

    if (!question || !answer) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        subjectId: id,
        question,
        answer,
      },
    });

    return NextResponse.json(flashcard);
  } catch (error) {
    console.error("[FLASHCARD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

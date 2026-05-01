import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subject = await prisma.subject.findUnique({
      where: { id },
      include: {
        materials: true,
        flashcards: true,
        questions: true,
      }
    });

    if (!subject) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error("[SUBJECT_GET_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao carregar matéria" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = body;

    const subject = await prisma.subject.update({
      where: { id },
      data: { name, color },
    });

    return NextResponse.json(subject);
  } catch (error: any) {
    console.error("[SUBJECT_PATCH_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao atualizar matéria" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.subject.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[SUBJECT_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao excluir matéria" }, { status: 500 });
  }
}

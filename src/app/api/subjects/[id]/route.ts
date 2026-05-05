import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { subjectSchema } from "@/lib/validations/subject";
import { z } from "zod";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const { id } = await params;
    const subject = await prisma.subject.findFirst({
      where: { 
        id,
        userId
      },
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
    console.error("[SUBJECT_GET_ERROR]:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Erro ao carregar matéria" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, color } = subjectSchema.parse(body);

    // Verify ownership before update
    const subject = await prisma.subject.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!subject) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: { name, color },
    });

    return NextResponse.json(updatedSubject);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }
    console.error("[SUBJECT_PATCH_ERROR]:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Erro ao atualizar matéria" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;

    // Verify ownership before delete
    const subject = await prisma.subject.findFirst({
      where: { id, userId: session.user.id }
    });

    if (!subject) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.subject.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[SUBJECT_DELETE_ERROR]:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Erro ao excluir matéria" }, { status: 500 });
  }
}

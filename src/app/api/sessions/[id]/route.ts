import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { sessionSchema } from "@/lib/validations/session";
import { z } from "zod";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await auth();
    if (!sessionUser?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = sessionUser.user.id;

    const { id } = await params;

    // First ensure ownership before deletion
    const existingSession = await prisma.studySession.findFirst({
      where: { id, subject: { userId } }
    });
    
    if (!existingSession) {
      return new NextResponse("Sessão não encontrada ou sem permissão", { status: 404 });
    }
    
    await prisma.studySession.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SESSIONS_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao excluir sessão" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await auth();
    if (!sessionUser?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = sessionUser.user.id;

    const { id } = await params;
    const body = await request.json();
    
    const validated = sessionSchema.parse(body);

    // Ensure resource ownership
    const existingSession = await prisma.studySession.findFirst({
      where: { id, subject: { userId } }
    });

    if (!existingSession) {
      return new NextResponse("Sessão não encontrada ou sem permissão", { status: 404 });
    }

    // Ensure user owns the destination subject
    if (validated.subjectId) {
      const sub = await prisma.subject.findFirst({
        where: { id: validated.subjectId, userId }
      });
      if (!sub) return new NextResponse("Matéria inválida", { status: 400 });
    }

    const updatedSession = await prisma.studySession.update({
      where: { id },
      data: {
        subjectId: validated.subjectId,
        startTime: new Date(validated.startTime),
        endTime: new Date(validated.endTime),
        duration: validated.duration,
        manual: !!validated.manual,
        type: validated.type || "Estudo",
        notes: validated.notes,
      }
    });

    return NextResponse.json(updatedSession);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error("[SESSIONS_PATCH_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao atualizar sessão" }, { status: 500 });
  }
}

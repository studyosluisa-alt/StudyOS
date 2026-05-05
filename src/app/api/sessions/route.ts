import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { sessionSchema } from "@/lib/validations/session";
import { z } from "zod";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const sessions = await prisma.studySession.findMany({
      where: {
        subject: { userId }
      },
      include: {
        subject: true,
      },
      orderBy: { startTime: "desc" },
    });
    return NextResponse.json(sessions);
  } catch (error) {
    console.error("[SESSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const sessionUser = await auth();
  if (!sessionUser?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = sessionUser.user.id;

  try {
    const body = await req.json();
    const { subjectId, startTime, endTime, duration, manual, type, notes, scheduleReview } = sessionSchema.parse(body);

    // Verify ownership of the subject
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId }
    });

    if (!subject) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await prisma.studySession.create({
      data: {
        subjectId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration,
        manual: !!manual,
        type: type || "Estudo",
        notes,
      },
    });

    if (scheduleReview) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Number(scheduleReview));
      await prisma.review.create({
        data: {
          subjectId,
          dueDate,
        }
      });
    }

    return NextResponse.json(session);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos: " + error.errors[0].message, { status: 400 });
    }
    console.error("[SESSIONS_POST]", error instanceof Error ? error.message : "Erro desconhecido");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

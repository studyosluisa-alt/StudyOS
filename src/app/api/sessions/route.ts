import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.studySession.findMany({
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
  try {
    const body = await req.json();
    const { subjectId, startTime, endTime, duration, manual, type, notes, scheduleReview } = body;

    if (!subjectId || !startTime || !endTime || !duration) {
      return new NextResponse("Missing required fields", { status: 400 });
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
    console.error("[SESSIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

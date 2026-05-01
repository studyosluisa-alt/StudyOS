import { auth } from "@/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const sessions = await prisma.studySession.findMany({
      where: {
        subject: { userId: session.user.id }
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

  try {
    const body = await req.json();
    const { subjectId, startTime, endTime, duration, manual, type, notes, scheduleReview } = body;

    if (!subjectId || !startTime || !endTime || !duration) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify ownership of the subject
    const subject = await prisma.subject.findFirst({
      where: { id: subjectId, userId: sessionUser.user.id }
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
    console.error("[SESSIONS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

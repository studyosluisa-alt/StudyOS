import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const subjects = await prisma.subject.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error("[SUBJECTS_GET_ERROR]:", error.message || error);
    return NextResponse.json({ error: "Erro ao buscar matérias", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const userId = session.user.id;

  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        userId,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("[SUBJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { subjectSchema } from "@/lib/validations/subject";
import { z } from "zod";

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
    const { name, color } = subjectSchema.parse(body);

    const subject = await prisma.subject.create({
      data: {
        name,
        userId,
        color,
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Dados inválidos", { status: 400 });
    }
    console.error("[SUBJECTS_POST]", error instanceof Error ? error.message : "Erro desconhecido");
    return new NextResponse("Internal Error", { status: 500 });
  }
}

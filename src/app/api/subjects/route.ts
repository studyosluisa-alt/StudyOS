import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(subjects);
  } catch (error: any) {
    console.error("[SUBJECTS_GET_ERROR]:", error.message || error);
    return NextResponse.json({ error: "Erro ao buscar matérias", details: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, color } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error("[SUBJECTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

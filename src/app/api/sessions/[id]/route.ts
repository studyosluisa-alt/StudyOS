import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.studySession.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SESSIONS_DELETE_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao excluir sessão" }, { status: 500 });
  }
}

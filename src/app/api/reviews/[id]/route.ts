import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { id } = await params;
    
    const review = await prisma.review.findFirst({
      where: { 
        id, 
        subject: { userId: session.user.id } 
      }
    });

    if (!review) {
      return new NextResponse("Not Found or Unauthorized", { status: 404 });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: { completed: true }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[REVIEW_PATCH_ERROR]:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Erro ao atualizar revisão" }, { status: 500 });
  }
}

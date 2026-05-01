import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  
  // Security check: Only ADMIN can access this
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { id } = await params;
    const { newPassword } = await request.json();

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: "Senha muito curta (mínimo 6 caracteres)" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    console.error("[ADMIN_PASSWORD_RESET_ERROR]:", error);
    return NextResponse.json({ error: "Erro ao resetar senha" }, { status: 500 });
  }
}

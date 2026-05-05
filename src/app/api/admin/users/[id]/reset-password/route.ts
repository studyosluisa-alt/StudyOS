import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { resetPasswordSchema } from "@/lib/validations/admin";
import { z } from "zod";

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
    const body = await request.json();
    const { newPassword } = resetPasswordSchema.parse(body);

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ message: "Senha atualizada com sucesso!" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Senha inválida: " + error.errors[0].message }, { status: 400 });
    }
    console.error("[ADMIN_PASSWORD_RESET_ERROR]:", error instanceof Error ? error.message : "Erro desconhecido");
    return NextResponse.json({ error: "Erro ao resetar senha" }, { status: 500 });
  }
}

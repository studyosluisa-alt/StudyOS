import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, url, type } = body;

    if (!title || !url) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const material = await prisma.material.create({
      data: {
        subjectId: id,
        title,
        url,
        type: type || "LINK",
      },
    });

    return NextResponse.json(material);
  } catch (error) {
    console.error("[MATERIAL_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

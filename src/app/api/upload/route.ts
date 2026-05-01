import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { v2 as cloudinary } from "cloudinary";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary with user-specific folder
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `studyos_uploads/${userId}`,
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    }) as any;

    return NextResponse.json({ 
      url: result.secure_url,
      name: file.name
    });

  } catch (error: any) {
    console.error("[UPLOAD_ERROR]:", error);
    return NextResponse.json({ error: "Upload failed: " + (error.message || "Unknown error") }, { status: 500 });
  }
}

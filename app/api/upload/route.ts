import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file") as File | null;
  const classType = form.get("classType") as string | null;

  if (!file || !classType) {
    return NextResponse.json({ error: "Missing file or classType" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const optimized = await sharp(buffer)
    .resize(1200, undefined, { withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();

  const blob = await put(`classes/class-${classType}-${Date.now()}.jpg`, optimized, {
    access: "public",
    contentType: "image/jpeg",
  });

  return NextResponse.json({ url: blob.url });
}

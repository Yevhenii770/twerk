import { db } from "@/db";
import { users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const allUsers = await db.select().from(users);
    return NextResponse.json(allUsers);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

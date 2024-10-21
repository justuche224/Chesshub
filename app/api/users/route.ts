// /pages/api/users.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const users = await db.user.findMany();
    return NextResponse.json(users);
  } catch (error) {
    console.error("Error processing move:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

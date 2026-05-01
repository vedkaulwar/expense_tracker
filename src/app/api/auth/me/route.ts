import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "expense_tracker_secret_key_2024";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; name: string; email: string };
    return NextResponse.json({ user: { name: decoded.name, email: decoded.email } });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

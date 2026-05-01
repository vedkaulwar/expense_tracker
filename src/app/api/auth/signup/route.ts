import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    return NextResponse.json({ success: true, message: "Account created! Please log in." }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}

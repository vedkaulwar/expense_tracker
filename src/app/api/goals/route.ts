import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Goal from "@/models/Goal";

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ goals: [], mockMode: true });

    const goals = await Goal.find().sort({ createdAt: -1 });
    return NextResponse.json(goals);
  } catch (error) {
    console.error("GET Goals Error:", error);
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();

    if (!db) return NextResponse.json({ message: "Mock mode: Goal saved", goal: body });

    const newGoal = new Goal(body);
    await newGoal.save();

    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error("POST Goal Error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}

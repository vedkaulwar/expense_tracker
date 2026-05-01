import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Subscription from "@/models/Subscription";

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    if (!db) return NextResponse.json({ subscriptions: [], mockMode: true });

    const subscriptions = await Subscription.find().sort({ nextBillingDate: 1 });
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error("GET Subscriptions Error:", error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    const body = await request.json();

    if (!db) return NextResponse.json({ message: "Mock mode: Subscription saved", subscription: body });

    const newSub = new Subscription(body);
    await newSub.save();

    return NextResponse.json(newSub, { status: 201 });
  } catch (error) {
    console.error("POST Subscription Error:", error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}

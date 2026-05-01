import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export async function GET(request: Request) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ transactions: [], mockMode: true });
    }

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : 50;

    const transactions = await Transaction.find().sort({ date: -1 }).limit(limit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await connectToDatabase();
    if (!db) {
      return NextResponse.json({ message: "Mock mode: Transaction saved", transaction: await request.json() });
    }

    const body = await request.json();
    const newTransaction = new Transaction(body);
    await newTransaction.save();

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error("POST Transaction Error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

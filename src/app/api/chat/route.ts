import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/db";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const db = await connectToDatabase();

    let responseText = "I'm a simulated AI! Connect MongoDB to see real insights based on your transactions.";

    if (db) {
      const msgLower = message.toLowerCase();

      if (msgLower.includes("total") || msgLower.includes("balance")) {
        const all = await Transaction.find({ type: "expense" });
        const total = all.reduce((sum, t) => sum + t.amount, 0);
        responseText = `Based on your records, your total expenses amount to ₹${total.toLocaleString("en-IN")}.`;
      } else if (msgLower.includes("food") || msgLower.includes("swiggy") || msgLower.includes("zomato")) {
        const food = await Transaction.find({ type: "expense", category: { $regex: /food/i } });
        const total = food.reduce((sum, t) => sum + t.amount, 0);
        responseText = `You've spent ₹${total.toLocaleString("en-IN")} on Food so far. Try cooking at home to save more!`;
      } else if (msgLower.includes("grocery") || msgLower.includes("groceries")) {
        const grocery = await Transaction.find({ type: "expense", category: { $regex: /grocery/i } });
        const total = grocery.reduce((sum, t) => sum + t.amount, 0);
        responseText = `Your grocery spending is ₹${total.toLocaleString("en-IN")}.`;
      } else if (msgLower.includes("shopping") || msgLower.includes("amazon")) {
        const shopping = await Transaction.find({ type: "expense", category: { $regex: /shopping/i } });
        const total = shopping.reduce((sum, t) => sum + t.amount, 0);
        responseText = `Your shopping expenses are currently at ₹${total.toLocaleString("en-IN")}.`;
      } else if (msgLower.includes("travel") || msgLower.includes("uber") || msgLower.includes("cab")) {
        const travel = await Transaction.find({ type: "expense", category: { $regex: /travel/i } });
        const total = travel.reduce((sum, t) => sum + t.amount, 0);
        responseText = `You've spent ₹${total.toLocaleString("en-IN")} on Travel.`;
      } else if (msgLower.includes("income") || msgLower.includes("salary") || msgLower.includes("earned")) {
        const income = await Transaction.find({ type: "income" });
        const total = income.reduce((sum, t) => sum + t.amount, 0);
        responseText = `Your total recorded income is ₹${total.toLocaleString("en-IN")}.`;
      } else {
        responseText = "I'm looking at your transactions! Ask me about 'Food', 'Travel', 'Shopping', 'Grocery', 'Income', or 'Total' spends.";
      }
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

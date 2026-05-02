import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await request.json();
    if (!message) return NextResponse.json({ error: "Message is required" }, { status: 400 });

    const msgLower = message.toLowerCase();
    let responseText = "";

    const txCollection = adminDb.collection("users").doc(userId).collection("transactions");

    if (msgLower.includes("total") || msgLower.includes("balance")) {
      const snapshot = await txCollection.where("type", "==", "expense").get();
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `Based on your records, your total expenses amount to ₹${total.toLocaleString("en-IN")}.`;
    } else if (msgLower.includes("food") || msgLower.includes("swiggy") || msgLower.includes("zomato")) {
      const snapshot = await txCollection.where("type", "==", "expense").get();
      const foodTotal = snapshot.docs
        .filter(doc => (doc.data().category || "").toLowerCase().includes("food"))
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `You've spent ₹${foodTotal.toLocaleString("en-IN")} on Food so far. Try cooking at home to save more!`;
    } else if (msgLower.includes("grocery") || msgLower.includes("groceries")) {
      const snapshot = await txCollection.where("type", "==", "expense").get();
      const groceryTotal = snapshot.docs
        .filter(doc => (doc.data().category || "").toLowerCase().includes("grocery"))
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `Your grocery spending is ₹${groceryTotal.toLocaleString("en-IN")}.`;
    } else if (msgLower.includes("shopping") || msgLower.includes("amazon")) {
      const snapshot = await txCollection.where("type", "==", "expense").get();
      const shoppingTotal = snapshot.docs
        .filter(doc => (doc.data().category || "").toLowerCase().includes("shopping"))
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `Your shopping expenses are currently at ₹${shoppingTotal.toLocaleString("en-IN")}.`;
    } else if (msgLower.includes("travel") || msgLower.includes("uber") || msgLower.includes("cab")) {
      const snapshot = await txCollection.where("type", "==", "expense").get();
      const travelTotal = snapshot.docs
        .filter(doc => (doc.data().category || "").toLowerCase().includes("travel"))
        .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `You've spent ₹${travelTotal.toLocaleString("en-IN")} on Travel.`;
    } else if (msgLower.includes("income") || msgLower.includes("salary") || msgLower.includes("earned")) {
      const snapshot = await txCollection.where("type", "==", "income").get();
      const total = snapshot.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
      responseText = `Your total recorded income is ₹${total.toLocaleString("en-IN")}.`;
    } else {
      responseText = "I'm looking at your transactions! Ask me about 'Food', 'Travel', 'Shopping', 'Grocery', 'Income', or 'Total' spends.";
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    return NextResponse.json({ reply: responseText });
  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

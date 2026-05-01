import { NextResponse } from "next/server";
import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function getUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { smsText } = await request.json();

    if (!smsText) {
      return NextResponse.json({ error: "SMS text is required" }, { status: 400 });
    }

    const amountMatch = smsText.match(/(?:Rs\.?|INR)\s*([\d,]+\.?\d*)/i);
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

    let merchant = "Unknown";
    const merchantMatch = smsText.match(/(?:to|at)\s+([A-Za-z0-9\s]+?)(?=\s+on|\s*$|\.)/i);
    if (merchantMatch) {
      merchant = merchantMatch[1].trim();
    }

    let type = "expense";
    if (/credited|received/i.test(smsText)) {
      type = "income";
    }

    let category = "Others";
    const lowerMerchant = merchant.toLowerCase();
    if (lowerMerchant.includes("swiggy") || lowerMerchant.includes("zomato") || lowerMerchant.includes("mcdonalds")) category = "Food 🍔";
    else if (lowerMerchant.includes("uber") || lowerMerchant.includes("ola") || lowerMerchant.includes("irctc") || lowerMerchant.includes("petrol")) category = "Travel 🚗";
    else if (lowerMerchant.includes("amazon") || lowerMerchant.includes("flipkart") || lowerMerchant.includes("myntra")) category = "Shopping 🛍️";
    else if (lowerMerchant.includes("jio") || lowerMerchant.includes("airtel") || lowerMerchant.includes("electricity")) category = "Bills 💡";

    let paymentMethod = "UPI";
    if (/card/i.test(smsText)) paymentMethod = "Card";
    else if (/bank transfer|neft|rtgs|imps/i.test(smsText)) paymentMethod = "Bank Transfer";
    
    const parsedData = {
      amount,
      merchant,
      category,
      type,
      source: "sms",
      status: "completed",
      paymentMethod,
      notes: smsText.substring(0, 50) + "...",
      date: new Date(),
      createdAt: new Date()
    };

    const docRef = await adminDb
      .collection("users")
      .doc(userId)
      .collection("transactions")
      .add(parsedData);

    return NextResponse.json({ success: true, transaction: { _id: docRef.id, ...parsedData } }, { status: 201 });

  } catch (error) {
    console.error("SMS Parse Error:", error);
    return NextResponse.json({ error: "Failed to parse SMS" }, { status: 500 });
  }
}

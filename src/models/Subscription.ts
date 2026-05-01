import mongoose, { Schema, Document } from "mongoose";

export interface ISubscription extends Document {
  name: string;
  amount: number;
  category: string;
  billingCycle: "monthly" | "yearly" | "weekly";
  nextBillingDate: Date;
  status: "active" | "cancelled";
}

const SubscriptionSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true, default: "Bills" },
    billingCycle: { type: String, enum: ["monthly", "yearly", "weekly"], default: "monthly" },
    nextBillingDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "cancelled"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);

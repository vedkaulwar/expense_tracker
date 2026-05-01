import mongoose, { Schema, Document } from "mongoose";

export interface IBudget extends Document {
  category: string; // "overall" or specific category like "Food"
  monthlyLimit: number;
}

const BudgetSchema: Schema = new Schema(
  {
    category: { type: String, required: true, unique: true },
    monthlyLimit: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Budget || mongoose.model<IBudget>("Budget", BudgetSchema);

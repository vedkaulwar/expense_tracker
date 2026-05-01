"use client";

import { useState, useRef } from "react";
import { Camera, Upload, X } from "lucide-react";
import Tesseract from "tesseract.js";

export default function ReceiptScanner({ onScanComplete }: { onScanComplete: (amount: string, merchant: string) => void }) {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: m => {
          if (m.status === "recognizing text") {
            setProgress(Math.floor(m.progress * 100));
          }
        }
      });

      const text = result.data.text.toLowerCase();
      
      // Basic heuristic to find amount
      const amountRegex = /(?:total|amount|amt)[\s:]*([₹$]?\s*\d+(?:\.\d{2})?)/i;
      const match = text.match(amountRegex);
      
      let amount = "";
      if (match) {
        amount = match[1].replace(/[^\d.]/g, "");
      } else {
        // Fallback: look for the largest number
        const numbers = text.match(/\d+\.\d{2}/g);
        if (numbers) {
          amount = Math.max(...numbers.map(Number)).toString();
        }
      }

      // Very basic merchant heuristic (first line of receipt)
      const lines = text.split('\n').filter(l => l.trim().length > 2);
      const merchant = lines[0] || "Unknown Merchant";

      onScanComplete(amount, merchant);
    } catch (err) {
      console.error(err);
      alert("Failed to scan receipt.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mb-4">
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleImageUpload}
        className="hidden"
      />
      
      <button 
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="w-full border-2 border-dashed border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 py-4 rounded-xl flex flex-col items-center justify-center gap-2 transition"
      >
        {isScanning ? (
          <>
            <div className="w-5 h-5 border-2 border-zinc-400 border-t-emerald-500 rounded-full animate-spin"></div>
            <span className="text-sm">Scanning... {progress}%</span>
          </>
        ) : (
          <>
            <Camera size={24} className="text-zinc-500" />
            <span className="text-sm font-medium text-white">Scan Receipt (OCR)</span>
            <span className="text-xs">Take a photo or upload an image</span>
          </>
        )}
      </button>
    </div>
  );
}

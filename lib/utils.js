import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

function toFiniteNumber(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") {
      try {
        const n = value.toNumber();
        return Number.isFinite(n) ? n : null;
      } catch {
        // ignore
      }
    }

    try {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    } catch {
      // ignore
    }
  }

  return null;
}

export function formatCurrencyINR(value, options = {}) {
  const amount = toFiniteNumber(value);
  if (amount === null) return "";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
    ...options,
  }).format(amount);
}

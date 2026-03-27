"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { GoogleGenAI } from "@google/genai";
import aj from "@/lib/arcjet";
import { request } from "@arcjet/next";

const serializeAmount = (obj) => ({
  ...obj,
  amount: obj.amount.toNumber(),
});

// Create Transaction
export async function createTransaction(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // Get request data for ArcJet
    const req = await request();

    // Check rate limit
    const decision = await aj.protect(req, {
      userId,
      requested: 1, // Specify how many tokens to consume
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        const { remaining, reset } = decision.reason;
        console.error({
          code: "RATE_LIMIT_EXCEEDED",
          details: {
            remaining,
            resetInSeconds: reset,
          },
        });

        throw new Error("Too many requests. Please try again later.");
      }

      throw new Error("Request blocked");
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const account = await db.account.findUnique({
      where: {
        id: data.accountId,
        userId: user.id,
      },
    });

    if (!account) {
      throw new Error("Account not found");
    }

    // Calculate new balance
    const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
    const newBalance = account.balance.toNumber() + balanceChange;

    // Create transaction and update account balance
    const transaction = await db.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          ...data,
          userId: user.id,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      await tx.account.update({
        where: { id: data.accountId },
        data: { balance: newBalance },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${transaction.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getTransaction(id) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const transaction = await db.transaction.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!transaction) throw new Error("Transaction not found");

  return serializeAmount(transaction);
}

export async function updateTransaction(id, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Get original transaction to calculate balance change
    const originalTransaction = await db.transaction.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        account: true,
      },
    });

    if (!originalTransaction) throw new Error("Transaction not found");

    // Calculate balance changes
    const oldBalanceChange =
      originalTransaction.type === "EXPENSE"
        ? -originalTransaction.amount.toNumber()
        : originalTransaction.amount.toNumber();

    const newBalanceChange =
      data.type === "EXPENSE" ? -data.amount : data.amount;

    const netBalanceChange = newBalanceChange - oldBalanceChange;

    // Update transaction and account balance in a transaction
    const transaction = await db.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: {
          id,
          userId: user.id,
        },
        data: {
          ...data,
          nextRecurringDate:
            data.isRecurring && data.recurringInterval
              ? calculateNextRecurringDate(data.date, data.recurringInterval)
              : null,
        },
      });

      // Update account balance
      await tx.account.update({
        where: { id: data.accountId },
        data: {
          balance: {
            increment: netBalanceChange,
          },
        },
      });

      return updated;
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${data.accountId}`);

    return { success: true, data: serializeAmount(transaction) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Get User Transactions
export async function getUserTransactions(query = {}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        ...query,
      },
      include: {
        account: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    return { success: true, data: transactions };
  } catch (error) {
    throw new Error(error.message);
  }
}

// Receipt scan (Gemini)
export async function scanReceipt(file) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY on server");
    }

    if (!file || typeof file.arrayBuffer !== "function") {
      throw new Error("Invalid receipt file");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Read the upload and send it as base64 to Gemini.
    const arrayBuffer = await file.arrayBuffer();
    const base64String = Buffer.from(arrayBuffer).toString("base64");

    const prompt = `
  Extract data from this receipt/bill image.

  Primary goal: return the FINAL TOTAL payable.
  If the image is noisy/tilted/partial, do a best-effort extraction.

  Important fallback:
  - If there is NO explicit final total (no TOTAL / GRAND TOTAL / AMOUNT DUE etc.), then add up the prices of all purchased items and use that sum as the total amount.
  - Ignore non-item numbers like phone numbers, order IDs, timestamps, loyalty IDs.

  Guidelines:
  - Prefer labels like: TOTAL, GRAND TOTAL, AMOUNT DUE, BALANCE DUE, TOTAL DUE.
  - Don't return subtotal/tax/tip unless there is no final total.
  - If multiple totals exist, pick the final payable amount (often near the bottom).
  - Return the amount as a plain number (no currency symbol). Use a dot for decimals.

Return ONLY valid JSON in EXACTLY this shape (no markdown, no extra text):
{
  "amount": number,
  "date": "ISO date string or empty string",
  "description": "brief summary or empty string",
  "merchantName": "string or empty string",
  "category": "one of: housing,transportation,groceries,utilities,entertainment,food,shopping,healthcare,education,personal,travel,insurance,gifts,bills,other-expense or empty string",
  "lineItems": [{ "name": "string", "amount": number }] // optional; include when no explicit total is present
}

  If you cannot confidently identify any total amount, return: {}
    `.trim();

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: base64String,
                mimeType: file.type || "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const text = response.text || "";

    const cleanedText = text
      .replace(/```json\s*/gi, "")
      .replace(/```/g, "")
      .trim();

    const jsonCandidateMatch = cleanedText.match(/\{[\s\S]*\}/);
    const jsonCandidate = jsonCandidateMatch
      ? jsonCandidateMatch[0]
      : cleanedText;

    const parseAmount = (value) => {
      if (typeof value === "number") {
        return Number.isFinite(value) ? value : undefined;
      }

      if (typeof value !== "string") return undefined;

      // Handle common currency/formatting: "₹1,234.50", "$ 12.34", "1 234,50"
      const normalized = value
        .trim()
        .replace(/\s+/g, "")
        .replace(/,/g, "")
        .replace(/[₹$€£]/g, "");

      const match = normalized.match(/-?\d+(?:\.\d+)?/);
      if (!match) return undefined;

      const parsed = Number.parseFloat(match[0]);
      return Number.isFinite(parsed) ? parsed : undefined;
    };

    const sumLineItems = (maybeItems) => {
      if (!Array.isArray(maybeItems) || maybeItems.length === 0)
        return undefined;

      let sum = 0;
      let count = 0;

      for (const item of maybeItems) {
        const candidate =
          typeof item === "number"
            ? item
            : parseAmount(item?.amount ?? item?.total ?? item?.price);

        if (candidate === undefined) continue;
        if (!Number.isFinite(candidate)) continue;
        if (candidate <= 0) continue;

        sum += candidate;
        count += 1;
      }

      if (count === 0) return undefined;
      return Number.isFinite(sum) ? sum : undefined;
    };

    const extractTotalFromText = (rawText) => {
      const t = String(rawText || "");

      // Look for total-like keywords first.
      const keywordPatterns = [
        /(grand\s*total|amount\s*due|balance\s*due|total\s*due|total)\s*[:-]?\s*([₹$€£]?\s*[0-9][0-9.,\s]*)/i,
      ];

      for (const re of keywordPatterns) {
        const m = t.match(re);
        if (m?.[2]) {
          const amt = parseAmount(m[2]);
          if (amt !== undefined) return amt;
        }
      }

      // Fallback: find the last reasonable money-like number in the text.
      const allNumbers = [...t.matchAll(/[₹$€£]?\s*[0-9][0-9.,]{1,}/g)].map(
        (m) => m[0]
      );
      for (let i = allNumbers.length - 1; i >= 0; i -= 1) {
        const amt = parseAmount(allNumbers[i]);
        if (amt !== undefined) return amt;
      }

      return undefined;
    };

    try {
      const data = JSON.parse(jsonCandidate);

      if (!data || Object.keys(data).length === 0) return null;

      const directAmount = parseAmount(data.amount);
      const computedFromItems = sumLineItems(data.lineItems ?? data.items);
      const amount = directAmount ?? computedFromItems;

      const dateObj = data.date ? new Date(data.date) : null;
      const date =
        dateObj && !Number.isNaN(dateObj.getTime())
          ? dateObj.toISOString()
          : undefined;

      const description =
        typeof data.description === "string" ? data.description : "";
      const category =
        typeof data.category === "string" ? data.category : undefined;
      const merchantName =
        typeof data.merchantName === "string" ? data.merchantName : undefined;

      const hasAnyUsefulField =
        (Number.isFinite(amount) && amount !== undefined) ||
        !!date ||
        !!description ||
        !!category ||
        !!merchantName;

      if (!hasAnyUsefulField) return null;

      return {
        ...(Number.isFinite(amount) ? { amount } : {}),
        ...(date ? { date } : {}),
        ...(description ? { description } : {}),
        ...(category ? { category } : {}),
        ...(merchantName ? { merchantName } : {}),
      };
    } catch (parseError) {
      // If Gemini didn't return valid JSON, try a simple keyword/number fallback.
      const fallbackAmount = extractTotalFromText(cleanedText);
      if (fallbackAmount !== undefined) {
        return { amount: fallbackAmount };
      }

      console.error("Error parsing JSON response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error scanning receipt:", error);
    throw new Error(error?.message || "Failed to scan receipt");
  }
}

// Helper function to calculate next recurring date
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date;
}

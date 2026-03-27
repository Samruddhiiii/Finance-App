#!/usr/bin/env node

require("dotenv").config();

const { Resend } = require("resend");
const { PrismaClient } = require("@prisma/client");
const readline = require("node:readline/promises");
const { stdin: input, stdout: output } = require("node:process");
const fs = require("node:fs/promises");
const path = require("node:path");

function formatCurrencyINR(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function parseMonthArg(args) {
  const monthFlagIndex = args.findIndex((a) => a === "--month");
  const monthInline = args.find((a) => a.startsWith("--month="));
  const monthValue =
    monthInline?.slice("--month=".length) ??
    (monthFlagIndex >= 0 ? args[monthFlagIndex + 1] : null);

  if (!monthValue) return null;
  const match = String(monthValue)
    .trim()
    .match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isInteger(year) || !Number.isInteger(monthIndex)) return null;
  if (monthIndex < 0 || monthIndex > 11) return null;

  return new Date(year, monthIndex, 1);
}

function getLastMonthDate() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function parseLimitArg(args) {
  const idx = args.findIndex((a) => a === "--limit");
  const inline = args.find((a) => a.startsWith("--limit="));
  const raw =
    inline?.slice("--limit=".length) ?? (idx >= 0 ? args[idx + 1] : null);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

function hasFlag(args, flag) {
  return args.includes(flag);
}

function getMonthMeta(monthDate) {
  const monthName = monthDate.toLocaleString("default", { month: "long" });
  const year = monthDate.getFullYear();
  const startDate = new Date(year, monthDate.getMonth(), 1);
  const endDate = new Date(year, monthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  const isoMonth = `${year}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  return { monthName, year, startDate, endDate, isoMonth };
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  // intentionally simple validation
  return trimmed.includes("@");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReportHtml({
  recipientName,
  monthName,
  year,
  totalIncome,
  totalExpenses,
  byCategory,
  insights,
  isRealData,
}) {
  const net = totalIncome - totalExpenses;
  const sortedCategories = Object.entries(byCategory || {})
    .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
    .slice(0, 8);

  const categoriesHtml = sortedCategories.length
    ? `
      <div style="margin-top:18px;">
        <div style="font-size:14px; font-weight:600; color:#111827; margin-bottom:8px;">Top spending categories</div>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
          ${sortedCategories
            .map(
              ([category, amount]) => `
              <tr>
                <td style="padding:10px 0; border-bottom:1px solid #eef2f7; color:#374151; font-size:14px;">${escapeHtml(
                  category
                )}</td>
                <td style="padding:10px 0; border-bottom:1px solid #eef2f7; color:#111827; font-size:14px; font-weight:600; text-align:right;">${escapeHtml(
                  formatCurrencyINR(amount)
                )}</td>
              </tr>
            `
            )
            .join("")}
        </table>
      </div>
    `.trim()
    : "";

  const insightsHtml = (insights || []).length
    ? `
      <div style="margin-top:18px;">
        <div style="font-size:14px; font-weight:600; color:#111827; margin-bottom:8px;">WelthIQ Insights</div>
        <ul style="margin:0; padding-left:18px; color:#374151; font-size:14px;">
          ${(insights || [])
            .slice(0, 4)
            .map((i) => `<li style="margin:0 0 8px;">${escapeHtml(i)}</li>`)
            .join("")}
        </ul>
      </div>
    `.trim()
    : "";

  const badgeText = isRealData
    ? "Generated from your WelthIQ activity"
    : "Monthly financial summary";

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Arial,sans-serif; background:#f6f9fc; padding:28px 16px;">
    <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:14px; overflow:hidden;">
      <div style="padding:18px 20px; border-bottom:1px solid #eef2f7; background:#ffffff;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="font-weight:800; letter-spacing:-0.02em; font-size:16px; color:#111827;">welthIQ.ai</div>
          <div style="font-size:12px; color:#6b7280;">Monthly report</div>
        </div>
      </div>

      <div style="padding:20px;">
        <div style="display:inline-block; font-size:12px; color:#1f2937; background:#f3f4f6; padding:6px 10px; border-radius:999px;">${escapeHtml(
          badgeText
        )}</div>

        <h1 style="margin:14px 0 8px; font-size:22px; line-height:1.2; color:#111827;">Your Monthly Financial Report</h1>
        <p style="margin:0 0 14px; font-size:14px; color:#374151;">Hi ${escapeHtml(
          recipientName || "there"
        )}, here’s your summary for <b>${escapeHtml(monthName)} ${escapeHtml(
          year
        )}</b>.</p>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin:14px 0;">
          <div style="padding:12px; border:1px solid #eef2f7; border-radius:12px; background:#fbfdff;">
            <div style="color:#6b7280; font-size:12px;">Total income</div>
            <div style="font-size:18px; font-weight:800; color:#111827; margin-top:6px;">${escapeHtml(
              formatCurrencyINR(totalIncome)
            )}</div>
          </div>
          <div style="padding:12px; border:1px solid #eef2f7; border-radius:12px; background:#fbfdff;">
            <div style="color:#6b7280; font-size:12px;">Total expenses</div>
            <div style="font-size:18px; font-weight:800; color:#111827; margin-top:6px;">${escapeHtml(
              formatCurrencyINR(totalExpenses)
            )}</div>
          </div>
          <div style="padding:12px; border:1px solid #eef2f7; border-radius:12px; background:#fbfdff; grid-column:1/-1;">
            <div style="color:#6b7280; font-size:12px;">Net</div>
            <div style="font-size:18px; font-weight:800; color:#111827; margin-top:6px;">${escapeHtml(
              formatCurrencyINR(net)
            )}</div>
          </div>
        </div>

        ${categoriesHtml}
        ${insightsHtml}

        <div style="margin-top:22px;">
          <a href="" style="display:inline-block; text-decoration:none; background:#111827; color:#ffffff; padding:10px 14px; border-radius:10px; font-size:14px; font-weight:700;">Open WelthIQ</a>
        </div>

        <div style="margin-top:18px; color:#9ca3af; font-size:12px; line-height:1.5;">
          You’re receiving this email because you used WelthIQ. If this was unexpected, you can ignore this message.
        </div>
      </div>
    </div>
  </div>
  `.trim();
}

function buildInsights({ totalIncome, totalExpenses, byCategory }) {
  const insights = [];
  const net = totalIncome - totalExpenses;

  if (totalIncome === 0 && totalExpenses === 0) {
    insights.push(
      "No transactions were found for this month — add a few to see your report populate."
    );
    return insights;
  }

  if (net < 0) {
    insights.push(
      "Your expenses were higher than your income this month — consider reviewing discretionary spending."
    );
  } else {
    insights.push(
      "You finished the month positive — nice job keeping net income above zero."
    );
  }

  const categories = Object.entries(byCategory || {}).sort(
    (a, b) => (b[1] ?? 0) - (a[1] ?? 0)
  );
  if (categories.length) {
    const [topCategory, topAmount] = categories[0];
    const pct = totalExpenses > 0 ? (topAmount / totalExpenses) * 100 : 0;
    if (pct >= 35) {
      insights.push(
        `Your biggest expense category was ${topCategory} (${pct.toFixed(
          0
        )}% of spending). Small changes there can have a big impact.`
      );
    } else {
      insights.push(
        `Your top expense category was ${topCategory}. Keep tracking it to spot trends.`
      );
    }
  }

  insights.push(
    "Set a budget for your top categories to stay on track next month."
  );
  return insights;
}

async function tryFetchRealStatsByEmail(email, reportMonth) {
  if (!process.env.DATABASE_URL) {
    return { ok: false, reason: "Missing DATABASE_URL" };
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { ok: false, reason: "User not found" };

    const { startDate, endDate } = getMonthMeta(reportMonth);
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const stats = transactions.reduce(
      (acc, t) => {
        const amount =
          typeof t.amount?.toNumber === "function"
            ? t.amount.toNumber()
            : Number(t.amount);
        if (t.type === "EXPENSE") {
          acc.totalExpenses += amount;
          acc.byCategory[t.category] =
            (acc.byCategory[t.category] || 0) + amount;
        } else {
          acc.totalIncome += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpenses: 0, byCategory: {} }
    );

    return {
      ok: true,
      user,
      stats,
    };
  } catch (err) {
    return { ok: false, reason: err?.message || String(err) };
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
}

async function main() {
  const args = process.argv.slice(2);

  const isDryRun = hasFlag(args, "--dry-run");
  const shouldPrintHtml = hasFlag(args, "--print-html");
  const sendAllUsers = hasFlag(args, "--all");
  const skipConfirm = hasFlag(args, "--yes");
  const limit = parseLimitArg(args);
  const toArg = args.find((a) => !a.startsWith("--"));
  const argEmail = toArg;

  const reportMonth = parseMonthArg(args) ?? getLastMonthDate();
  const { monthName, year } = getMonthMeta(reportMonth);

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Missing RESEND_API_KEY in environment (.env)");
    process.exit(1);
  }

  // Fixed demo-like amounts (requested)
  const totalIncome = 50000;
  const totalExpenses = 32500;
  const byCategory = {
    Housing: 15000,
    Groceries: 6500,
    Transportation: 4200,
    Utilities: 3800,
    Entertainment: 3000,
  };
  const insights = buildInsights({ totalIncome, totalExpenses, byCategory });

  let recipients = [];
  if (sendAllUsers) {
    if (!process.env.DATABASE_URL) {
      console.error(
        "Missing DATABASE_URL in environment (.env). Needed for --all."
      );
      process.exit(1);
    }

    const prisma = new PrismaClient();
    try {
      const users = await prisma.user.findMany({
        select: { email: true, name: true },
        orderBy: { createdAt: "asc" },
        ...(limit ? { take: limit } : {}),
      });

      recipients = users
        .map((u) => ({ email: u.email, name: u.name || "" }))
        .filter((u) => isValidEmail(u.email));

      if (!recipients.length) {
        console.error("No users found to email.");
        process.exit(1);
      }
    } finally {
      await prisma.$disconnect().catch(() => {});
    }

    if (!skipConfirm && !isDryRun) {
      const rl = readline.createInterface({ input, output });
      const answer = await rl.question(
        `About to send a monthly report to ${recipients.length} users. Type SEND to confirm: `
      );
      rl.close();

      if (String(answer).trim() !== "SEND") {
        console.log("Cancelled.");
        return;
      }
    }
  } else {
    let to = argEmail;
    if (!isValidEmail(to)) {
      const rl = readline.createInterface({ input, output });
      to = await rl.question("Enter recipient email: ");
      rl.close();
    }

    if (!isValidEmail(to)) {
      console.error(
        "Invalid email. Provide it as an argument or enter a valid email when prompted."
      );
      process.exit(1);
    }

    recipients = [{ email: to.trim(), name: "" }];
  }

  const resend = new Resend(apiKey);

  if (isDryRun) {
    const outDir = path.join(process.cwd(), "tmp");
    const outFile = path.join(outDir, "monthly-report.html");
    const previewHtml = buildReportHtml({
      recipientName: recipients[0]?.name || "",
      monthName,
      year,
      totalIncome,
      totalExpenses,
      byCategory,
      insights,
      isRealData: false,
    });
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(outFile, previewHtml, "utf8");

    console.log("--- DRY RUN (no email sent) ---");
    console.log(
      `To: ${sendAllUsers ? `${recipients.length} users` : recipients[0].email}`
    );
    console.log(`Month: ${monthName} ${year}`);
    console.log(`Data: fixed amounts (50,000 / 32,500 / 17,500)`);
    console.log(`HTML saved to: ${outFile}`);
    if (shouldPrintHtml) console.log(previewHtml);
    return;
  }

  let sent = 0;
  for (const r of recipients) {
    const html = buildReportHtml({
      recipientName: r.name,
      monthName,
      year,
      totalIncome,
      totalExpenses,
      byCategory,
      insights,
      isRealData: false,
    });

    const result = await resend.emails.send({
      from: "WelthIQ <onboarding@resend.dev>",
      to: r.email,
      subject: `Your Monthly Financial Report - ${monthName}`,
      html,
    });

    if (result?.error) {
      console.error(`Failed to send to ${r.email}:`, result.error);
      continue;
    }

    sent += 1;
  }

  console.log(
    `✅ Monthly report sent to ${sent}/${recipients.length} recipient(s).`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

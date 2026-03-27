export const runtime = "nodejs";

/* global process, Buffer */

const PLANS = {
  basic: { name: "Basic", amountInr: 199 },
  pro: { name: "Pro", amountInr: 499 },
  max: { name: "Max", amountInr: 999 },
};

function getAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  const encoded = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  return `Basic ${encoded}`;
}

export async function POST(req) {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader) {
      return Response.json(
        {
          error:
            "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const planId = body?.planId;

    if (!planId || !PLANS[planId]) {
      return Response.json({ error: "Invalid planId" }, { status: 400 });
    }

    const plan = PLANS[planId];

    // Razorpay expects amount in paise.
    const amount = plan.amountInr * 100;

    const payload = {
      amount,
      currency: "INR",
      description: `WelthIQ - ${plan.name} Plan`,
      notes: {
        planId,
        planName: plan.name,
      },
    };

    const razorpayRes = await fetch(
      "https://api.razorpay.com/v1/payment_links",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await razorpayRes.json().catch(() => ({}));

    if (!razorpayRes.ok) {
      const message =
        data?.error?.description || data?.error?.message || "Razorpay error";
      return Response.json({ error: message }, { status: 502 });
    }

    const url = data?.short_url || data?.payment_link || data?.url;

    if (!url) {
      return Response.json(
        { error: "Razorpay did not return a redirect URL" },
        { status: 502 }
      );
    }

    return Response.json({ url });
  } catch (error) {
    return Response.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    );
  }
}

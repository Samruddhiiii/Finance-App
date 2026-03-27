"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card2 } from "@/components/ui/card2";
import { formatCurrencyINR } from "@/lib/utils";

const PLANS = [
  {
    id: "basic",
    name: "Basic",
    priceInr: 199,
    description: "For personal tracking and budgeting.",
    features: ["Accounts & transactions", "Budget tracking", "Basic insights"],
  },
  {
    id: "pro",
    name: "Pro",
    priceInr: 499,
    description: "For power users who want automation.",
    features: [
      "Everything in Basic",
      "Recurring transactions",
      "Priority insights",
    ],
  },
  {
    id: "max",
    name: "Max",
    priceInr: 999,
    description: "For maximum automation and reporting.",
    features: [
      "Everything in Pro",
      "Monthly AI report emails",
      "Budget alert emails",
    ],
  },
];

export default function PlansPage() {
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  async function handleBuy(planId) {
    try {
      setLoadingPlanId(planId);

      const res = await fetch("/api/razorpay/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || "Failed to create payment link");
      }

      if (!json?.url) {
        throw new Error("Missing Razorpay redirect URL");
      }

      window.location.href = json.url;
    } catch (error) {
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoadingPlanId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Plans</h1>
        <p className="mt-2 text-muted-foreground">
          Choose a plan that fits your needs. Prices are in INR.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {PLANS.map((plan) => {
          const isLoading = loadingPlanId === plan.id;
          return (
            <Card2
              key={plan.id}
              containerHeight="360px"
              imageHeight="360px"
              containerWidth="100%"
              imageWidth="100%"
              scaleOnHover={1.02}
              rotateAmplitude={10}
              showMobileWarning={false}
              showTooltip={false}
              displayOverlayContent
              overlayContent={
                <div className="h-full w-full rounded-[15px] bg-black p-6 text-white flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-medium text-white/70">
                      {plan.name}
                    </div>
                    <div className="mt-2 text-3xl font-bold">
                      {formatCurrencyINR(plan.priceInr, {
                        maximumFractionDigits: 0,
                      })}
                      <span className="ml-1 text-sm font-medium text-white/70">
                        /month
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-white/70">
                      {plan.description}
                    </p>

                    <ul className="mt-4 space-y-2 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-white/80">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button
                      className="w-full bg-white text-black hover:bg-white/90"
                      onClick={() => handleBuy(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Redirecting..." : "Buy Plan"}
                    </Button>
                  </div>
                </div>
              }
            />
          );
        })}
      </div>

      <div className="mt-10 text-center">
        <Link href="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}

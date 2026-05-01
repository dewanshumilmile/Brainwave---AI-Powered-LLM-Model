// src/components/landing/Pricing.tsx
"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for trying it out",
    features: [
      "50 AI searches / day",
      "PDF & DOCX upload (5MB max)",
      "Web search citations",
      "Conversation history",
      "Dark / Light mode",
    ],
    cta: "Get started free",
    href: "/sign-up",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/mo",
    desc: "For power users",
    features: [
      "Unlimited AI searches",
      "Large file uploads (50MB)",
      "Image understanding",
      "Priority speed",
      "Export conversations",
      "API access",
    ],
    cta: "Start Pro",
    href: "/sign-up",
    highlight: true,
  },
  {
    name: "Team",
    price: "$39",
    period: "/mo",
    desc: "For teams and orgs",
    features: [
      "Everything in Pro",
      "Up to 10 users",
      "Shared conversation library",
      "Admin dashboard",
      "SSO / SAML (coming soon)",
    ],
    cta: "Contact us",
    href: "#",
    highlight: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="px-4 py-24 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Simple pricing</h2>
          <p className="mt-4 text-muted-foreground text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative rounded-xl border p-6 shadow-sm",
                plan.highlight
                  ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-card"
              )}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <p className={cn("text-sm font-medium mb-1", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className={cn("text-sm pb-1", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>{plan.period}</span>}
              </div>
              <p className={cn("text-sm mb-6", plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground")}>{plan.desc}</p>

              <ul className="space-y-2.5 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className={cn("h-4 w-4 shrink-0", plan.highlight ? "text-primary-foreground" : "text-green-500")} />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.highlight ? "secondary" : "default"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

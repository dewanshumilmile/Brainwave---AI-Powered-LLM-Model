// src/lib/arcjet.ts
import arcjet, {
  tokenBucket,
  shield,
  detectBot,
  slidingWindow,
} from "@arcjet/next";

// ── Main AI chat limiter ───────────────────────────────────────────────────
// Limits AI requests to prevent abuse and API cost overruns
export const chatArcjet = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userId"], // Rate limit per user
  rules: [
    // Shield blocks common attacks (SQLi, XSS, etc.)
    shield({ mode: "LIVE" }),

    // Token bucket: 20 requests per hour per user
    tokenBucket({
      mode: "LIVE",
      refillRate: 20,
      interval: "1h",
      capacity: 20,
    }),
  ],
});

// ── Upload route limiter ───────────────────────────────────────────────────
export const uploadArcjet = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["userId"],
  rules: [
    shield({ mode: "LIVE" }),
    // Sliding window: 10 uploads per hour
    slidingWindow({
      mode: "LIVE",
      interval: "1h",
      max: 10,
    }),
  ],
});

// ── Auth route protection ──────────────────────────────────────────────────
export const authArcjet = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    // Block bots on auth routes
    detectBot({
      mode: "LIVE",
      allow: [], // block all bots
    }),
    // Strict rate limit on auth: 10 attempts per 15 mins per IP
    slidingWindow({
      mode: "LIVE",
      interval: "15m",
      max: 10,
    }),
  ],
});

// ── General API protection ─────────────────────────────────────────────────
export const apiArcjet = arcjet({
  key: process.env.ARCJET_KEY!,
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 60, // 60 requests per minute per IP
    }),
  ],
});
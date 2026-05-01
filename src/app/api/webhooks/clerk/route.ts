// src/app/api/webhooks/clerk/route.ts
// Optional: sync Clerk user events to your DB (e.g. for analytics)
// Not required for core functionality — Clerk userId is used directly.
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // You can verify the Clerk webhook signature here using svix
  // and handle events like user.created, user.deleted, etc.
  // For now this is a placeholder.
  const body = await req.json();
  console.log("Clerk webhook event:", body.type);
  return NextResponse.json({ received: true });
}

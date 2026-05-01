// src/app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Navbar } from "@/components/layout/Navbar";
import Link from "next/link";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard/chat");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Pricing />
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
  <p>AI-powered platform for smart search, file analysis, and instant responses.</p>
</footer>
    </main>
  );
}

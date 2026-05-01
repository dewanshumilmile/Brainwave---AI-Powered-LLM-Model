// src/components/layout/Navbar.tsx
"use client";

import Link from "next/link";
import { useAuth, UserButton, SignInButton } from "@clerk/nextjs";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </div>
          Brainwave
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isSignedIn ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href="/dashboard/chat">Open App</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">Log in</Button>
              </SignInButton>
              <Button size="sm" asChild>
                <Link href="/sign-up">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

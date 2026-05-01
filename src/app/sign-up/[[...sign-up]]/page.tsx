// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from "@clerk/nextjs";
import { Search } from "lucide-react";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <div className="flex h-14 items-center px-6 border-b">
        <Link href="/" className="flex items-center gap-2 font-semibold text-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Search className="h-4 w-4" />
          </div>
          Brainwave
        </Link>
      </div>

      {/* Center content */}
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Start searching with AI for free
            </p>
          </div>

          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#000000",
                colorBackground: "hsl(240 10% 3.9%)",
                colorInputBackground: "hsl(240 3.7% 15.9%)",
                colorInputText: "hsl(0 0% 98%)",
                colorText: "hsl(0 0% 98%)",
                colorTextSecondary: "hsl(240 5% 64.9%)",
                colorNeutral: "hsl(0 0% 98%)",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
              },
              elements: {
                rootBox: "w-full",
                card: "bg-card border border-border shadow-xl rounded-2xl p-6 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "border border-border bg-card hover:bg-accent text-foreground rounded-xl transition-colors",
                socialButtonsBlockButtonText: "font-medium text-sm",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground text-xs",
                formFieldLabel: "text-sm font-medium text-foreground",
                formFieldInput:
                  "bg-muted border border-border text-foreground rounded-lg focus:ring-2 focus:ring-ring text-sm",
                formButtonPrimary:
                  "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors",
                footerActionText: "text-muted-foreground text-sm",
                footerActionLink: "text-foreground font-medium hover:underline",
                formFieldInputShowPasswordButton: "text-muted-foreground",
                otpCodeFieldInput:
                  "bg-muted border border-border text-foreground rounded-lg",
                alert: "bg-destructive/10 border-destructive/30 text-destructive rounded-xl",
                alertText: "text-sm",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
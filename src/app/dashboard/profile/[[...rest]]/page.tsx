// src/app/dashboard/profile/[[...rest]]/page.tsx
import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings
          </p>
        </div>

        <UserProfile
          routing="hash"
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
              card: "bg-card border border-border shadow-sm rounded-2xl w-full",
              navbar: "hidden",
              pageScrollBox: "p-6",
              headerTitle: "text-foreground font-semibold",
              headerSubtitle: "text-muted-foreground text-sm",
              profileSectionTitle: "text-foreground font-medium text-sm",
              profileSectionContent: "text-muted-foreground text-sm",
              profileSectionPrimaryButton:
                "border border-border bg-card hover:bg-accent text-foreground rounded-xl text-sm transition-colors",
              formFieldLabel: "text-sm font-medium text-foreground",
              formFieldInput:
                "bg-muted border border-border text-foreground rounded-lg text-sm",
              formButtonPrimary:
                "bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors",
              formButtonReset:
                "border border-border bg-card hover:bg-accent text-foreground rounded-xl transition-colors",
              badge: "bg-muted text-muted-foreground text-xs rounded-full",
              avatarImageActionsUpload:
                "border border-border bg-card hover:bg-accent text-foreground rounded-xl text-sm transition-colors",
              dividerLine: "bg-border",
              accordionTriggerButton: "text-foreground hover:bg-accent rounded-lg",
              navbarButton: "text-muted-foreground hover:text-foreground",
              destructiveActionButton:
                "bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
// src/app/dashboard/layout.tsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        user={{
          id: userId,
          name: user?.fullName ?? user?.firstName ?? "User",
          email: user?.emailAddresses[0]?.emailAddress ?? "",
          imageUrl: user?.imageUrl ?? null,
        }}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}

import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(async (auth, req: NextRequest) => {
  const { userId } = await auth();
  const { pathname } = req.nextUrl;

  // If not logged in and trying to access dashboard → redirect to sign-in
  if (!userId && pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/sign-in", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // If logged in and on auth pages → redirect to dashboard
  if (userId && (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up"))) {
    const dashboardUrl = new URL("/dashboard/chat", req.url);
    return NextResponse.redirect(dashboardUrl);
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
import { clerkMiddleware } from "@clerk/nextjs/server";

const middleware = clerkMiddleware({
  publicRoutes: ["/", "/plans", "/sign-in(.*)", "/sign-up(.*)"],
});

export default middleware;

// Middleware matcher
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)", "/api(.*)"],
};

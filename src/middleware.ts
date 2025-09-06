import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextMiddlewareRequestParam } from "node_modules/@clerk/nextjs/dist/types/server/types";

/**
 * Route matcher to protect all routes except for the sign-in and sign-up pages
 */
const _isProtectedRoute = createRouteMatcher(["/((?!sign-in|sign-up).*)"]);

/**
 * Clerk middleware to handle authentication and authorization
 * @see https://clerk.com/docs/references/nextjs/clerk-middleware
 */
export default clerkMiddleware(async function middleware(_auth, req: NextMiddlewareRequestParam) {
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/root", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-full-url", req.nextUrl.toString());

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/webhooks (webhook endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - favicon.png (favicon file)
     * And except for files with these extensions:
     * - .html, .css, .js, .jpg, .jpeg, .webp, .png, .gif, .svg, .ttf
     * - .woff, .woff2, .ico, .csv, .doc, .docx, .xls, .xlsx, .zip
     * - .webmanifest
     */
    "/((?!api/webhooks|_next/static|_next/image|favicon\\.ico|favicon\\.png|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  ],
};

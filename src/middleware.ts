import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that DON'T require auth
const publicRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;

  // If visiting a public route and already logged in → redirect to dashboard
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If visiting a protected route and NOT logged in → redirect to login
  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes EXCEPT static files and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

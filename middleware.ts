import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";
import type { JWTPayload } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  // If the request is for the admin area, require an auth token and admin role
  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET!)
    );

    // Require basic userId in payload
    if (!payload?.userId) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // If path starts with /admin, require role === 'admin'
    const pathname = new URL(req.url).pathname;
    if (pathname.startsWith("/admin")) {
      const jwtPayload = payload as JWTPayload;
      const role = jwtPayload.role as string | undefined;
      if (role !== "admin") {
        // Could redirect to a 'not authorized' 
        return NextResponse.redirect(new URL("/signin", req.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/reservation/:path*", "/admin/:path*"],
};

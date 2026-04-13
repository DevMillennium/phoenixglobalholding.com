import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { jwtVerify } from "jose";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      const res = NextResponse.next();
      res.headers.set("X-Robots-Tag", "noindex, nofollow");
      return res;
    }
    const secret = process.env.ADMIN_JWT_SECRET?.trim();
    if (!secret || secret.length < 32) {
      return NextResponse.redirect(new URL("/admin/login?setup=1", request.url));
    }
    const token = request.cookies.get("phx_admin")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};

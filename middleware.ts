import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./src/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const ADMIN_COOKIE = "edarcon_admin";

// Public admin entry points that do not require a session.
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/logout"];

function isValidAdminSession(value: string | undefined): boolean {
  if (!value) return false;
  // TODO: Replace mock auth with Supabase Auth / Auth.js in production.
  try {
    const payload = JSON.parse(Buffer.from(value, "base64").toString("utf-8"));
    return Boolean(
      payload &&
        typeof payload === "object" &&
        "email" in payload &&
        "exp" in payload &&
        Date.now() < (payload.exp as number)
    );
  } catch {
    return false;
  }
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes live outside the next-intl locale scope (no /:locale prefix).
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Admin lives outside next-intl: English only, LTR, own root layout.
  if (pathname.startsWith("/admin")) {
    const isPublic = ADMIN_PUBLIC_PATHS.includes(pathname);

    if (!isPublic && !isValidAdminSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|_vercel|.*\\..*).*)"],
};

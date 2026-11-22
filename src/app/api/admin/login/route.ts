import { cookies } from "next/headers";
import { authenticateUser } from "@/lib/admin/users";

const COOKIE_NAME = "edarcon_admin";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// TODO: Replace mock auth with Supabase Auth / Auth.js in production.
export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const user = authenticateUser(body.email ?? "", body.password ?? "");
  if (!user) {
    return Response.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const payload = {
    name: user.name,
    email: user.email,
    role: user.role,
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  };
  const token = Buffer.from(JSON.stringify(payload)).toString("base64");

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });

  return Response.json({ user });
}

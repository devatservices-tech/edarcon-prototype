import { cookies } from "next/headers";
import { z } from "zod";
import { getAdminUser, updateAdminProfile } from "@/lib/admin/users";
import { validateSession } from "@/lib/admin/session";

const COOKIE_NAME = "edarcon_admin";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

const profileUpdateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address"),
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).superRefine((data, context) => {
  if (data.newPassword !== undefined) {
    if (data.newPassword.length < 8) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["newPassword"],
        message: "New password must be at least 8 characters",
      });
    }
    if (data.newPassword !== data.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
  }
});

export async function GET() {
  const session = validateSession((await cookies()).get(COOKIE_NAME)?.value);
  if (!session) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  const user = getAdminUser(session.email);
  if (!user) {
    return Response.json({ error: "Account not found" }, { status: 404 });
  }

  return Response.json({ user });
}

export async function PATCH(request: Request) {
  const session = validateSession((await cookies()).get(COOKIE_NAME)?.value);
  if (!session) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid profile details" }, { status: 400 });
  }

  const result = updateAdminProfile(
    session.email,
    parsed.data.currentPassword,
    {
      name: parsed.data.name,
      email: parsed.data.email,
      newPassword: parsed.data.newPassword,
    },
  );
  if ("error" in result) {
    const status = result.error === "email_in_use" ? 409 : 401;
    const message = result.error === "email_in_use"
      ? "An account already uses that email address"
      : "Current password is incorrect";
    return Response.json({ error: message }, { status });
  }

  const token = Buffer.from(JSON.stringify({
    ...result.user,
    exp: Date.now() + COOKIE_MAX_AGE * 1000,
  })).toString("base64");
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE,
  });

  return Response.json({ user: result.user });
}

import type { UserRole } from "@/lib/admin/users";
import { canAccessRoute } from "@/lib/admin/users";

export interface AdminSession {
  name: string;
  email: string;
  role: UserRole;
}

export function validateSession(value: string | undefined): AdminSession | null {
  if (!value) return null;
  // TODO: Replace mock auth with Supabase Auth / Auth.js in production.
  try {
    const payload = JSON.parse(
      Buffer.from(value, "base64").toString("utf-8"),
    ) as AdminSession & { exp: number };
    if (!payload || !payload.email || typeof payload.exp !== "number") return null;
    if (Date.now() >= payload.exp) return null;
    return { name: payload.name, email: payload.email, role: payload.role };
  } catch {
    return null;
  }
}

export { canAccessRoute };

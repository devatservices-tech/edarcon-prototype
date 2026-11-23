export type UserRole = "super_admin" | "editor" | "sales";

export interface AdminUser {
  name: string;
  email: string;
  role: UserRole;
}

export type AdminProfileUpdateResult =
  | { user: AdminUser }
  | { error: "invalid_password" | "email_in_use" };

// TODO: Replace this mock user store with Supabase Auth / Auth.js in production.
export const ADMIN_USERS: Record<string, AdminUser & { password: string }> = {
  "admin@edarcon.com": {
    name: "Admin User",
    email: "admin@edarcon.com",
    password: "Admin@123",
    role: "super_admin",
  },
  "editor@edarcon.com": {
    name: "Editor User",
    email: "editor@edarcon.com",
    password: "Editor@123",
    role: "editor",
  },
  "sales@edarcon.com": {
    name: "Sales User",
    email: "sales@edarcon.com",
    password: "Sales@123",
    role: "sales",
  },
};

export function getAdminUser(email: string): AdminUser | null {
  const user = ADMIN_USERS[email.toLowerCase()];
  if (!user) return null;
  return { name: user.name, email: user.email, role: user.role };
}

export function updateAdminProfile(
  currentEmail: string,
  currentPassword: string,
  updates: { name: string; email: string; newPassword?: string },
): AdminProfileUpdateResult {
  const currentKey = currentEmail.toLowerCase();
  const currentUser = ADMIN_USERS[currentKey];
  if (!currentUser || currentUser.password !== currentPassword) {
    return { error: "invalid_password" };
  }

  const nextEmail = updates.email.trim().toLowerCase();
  if (nextEmail !== currentKey && ADMIN_USERS[nextEmail]) {
    return { error: "email_in_use" };
  }

  const updatedUser = {
    ...currentUser,
    name: updates.name.trim(),
    email: nextEmail,
    password: updates.newPassword || currentUser.password,
  };
  delete ADMIN_USERS[currentKey];
  ADMIN_USERS[nextEmail] = updatedUser;

  return {
    user: {
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    },
  };
}

export function authenticateUser(email: string, password: string): AdminUser | null {
  const user = ADMIN_USERS[email.toLowerCase()];
  if (!user || user.password !== password) return null;
  return { name: user.name, email: user.email, role: user.role };
}

export const ROUTE_ROLES: Record<string, UserRole[]> = {
  "/admin/rfq": ["super_admin", "sales"],
  "/admin/settings/users": ["super_admin"],
};

export function canAccessRoute(role: UserRole, pathname: string): boolean {
  const allowed = ROUTE_ROLES[pathname];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function canManage(collection: string, role: UserRole): boolean {
  // Editor cannot manage RFQ or Settings users; Sales sees Dashboard, RFQ and Contact Details only.
  if (role === "super_admin") return true;
  if (role === "editor") return collection !== "rfqs" && collection !== "users";
  if (role === "sales")
    return ["dashboard", "rfqs", "contact-details"].includes(collection);
  return false;
}

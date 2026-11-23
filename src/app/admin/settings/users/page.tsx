import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { validateSession, canAccessRoute } from "@/lib/admin/session";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader } from "@/components/admin/PageHeader";
import { EmptyState } from "@/components/admin/EmptyState";

export default async function SettingsUsersPage() {
  const session = validateSession((await cookies()).get("edarcon_admin")?.value);
  if (!session) redirect("/admin/login");
  if (!canAccessRoute(session.role, "/admin/settings/users")) redirect("/admin/dashboard");

  const user = { name: session.name, email: session.email, role: session.role };
  return (
    <AdminLayout user={user}>
      <PageHeader
        title="Users"
        description="Manage admin accounts and roles."
        breadcrumb={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Website Settings", href: "/admin/settings" },
          { label: "Users" },
        ]}
      />
      <EmptyState title="No users yet" iconKey="Package" />
    </AdminLayout>
  );
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminProfileForms } from "@/components/admin/AdminProfileForms";
import { PageHeader } from "@/components/admin/PageHeader";
import { validateSession } from "@/lib/admin/session";

export default async function AdminProfilePage() {
  const session = validateSession((await cookies()).get("edarcon_admin")?.value);
  if (!session) redirect("/admin/login");

  const user = { name: session.name, email: session.email, role: session.role };

  return (
    <AdminLayout user={user}>
      <PageHeader
        title="Profile"
        description="Manage your account details and password."
        breadcrumb={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Profile" }]}
      />
      <AdminProfileForms initialUser={user} />
    </AdminLayout>
  );
}

import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("edarcon_admin");
  return Response.json({ ok: true });
}

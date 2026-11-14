import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name:         z.string().min(2),
  company:      z.string().min(1),
  email:        z.string().email(),
  phone:        z.string().min(7),
  service:      z.string().min(1),
  siteLocation: z.string().min(1),
  message:      z.string().min(10),
  items:        z.array(z.object({
    productId: z.string(),
    quantity:  z.number().min(1),
  })).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    schema.parse(body);

    return NextResponse.json({ ok: true, message: "Received" });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 });
    }
    console.error("[contact]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

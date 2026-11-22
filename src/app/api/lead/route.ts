import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const MAX_PAYLOAD_BYTES = 10 * 1024;

const schema = z.object({
  name:    z.string().min(1),
  email:   z.string().email(),
  phone:   z.string().min(7),
  service: z.string().min(1),
  details: z.string().optional(),
  locale:  z.enum(["en", "ar"]),
  timestamp: z.string().datetime(),
  // Honeypot: legitimate bots/clients never fill this. If present, reject.
  _hp: z.string().optional().refine((v) => !v, {
    message: "Honeypot field must be empty",
  }),
});

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (Buffer.byteLength(raw) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const body = JSON.parse(raw);
    schema.parse(body);

    // TODO: connect email (Resend) or CRM integration here
    console.log("[api/lead] New lead received:", body);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 });
    }
    console.error("[api/lead]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

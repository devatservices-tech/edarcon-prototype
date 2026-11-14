import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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

const resend = new Resend(process.env.RESEND_API_KEY);

function itemsHtml(items: { productId: string; quantity: number }[] | undefined) {
  if (!items || items.length === 0) return "";
  const rows = items.map((i) => `
    <tr>
      <td style="border:1px solid #ddd;padding:6px">${i.productId}</td>
      <td style="border:1px solid #ddd;padding:6px;text-align:center">${i.quantity}</td>
    </tr>
  `).join("");
  return `
    <h3>Equipment Enquiry Items</h3>
    <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
      <tr><th style="border:1px solid #ddd;padding:6px">Product</th><th style="border:1px solid #ddd;padding:6px">Qty</th></tr>
      ${rows}
    </table>
  `;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    await resend.emails.send({
      from:    "Edarcon Website <noreply@edarcon.com>",
      to:      ["Edarcon@edarcon.com"],
      replyTo: data.email,
      subject: `New Quote Request — ${data.service} — ${data.company}${data.items ? " (Equipment Enquiry)" : ""}`,
      html: `
        <h2>New Quote Request</h2>
        <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
          <tr><td><strong>Name</strong></td><td>${data.name}</td></tr>
          <tr><td><strong>Company</strong></td><td>${data.company}</td></tr>
          <tr><td><strong>Email</strong></td><td>${data.email}</td></tr>
          <tr><td><strong>Phone</strong></td><td>${data.phone}</td></tr>
          <tr><td><strong>Service</strong></td><td>${data.service}</td></tr>
          <tr><td><strong>Site Location</strong></td><td>${data.siteLocation}</td></tr>
        </table>
        ${itemsHtml(data.items)}
        <h3>Message</h3>
        <p style="font-family:sans-serif;font-size:14px">${data.message.replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", issues: err.issues }, { status: 400 });
    }
    console.error("[contact]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

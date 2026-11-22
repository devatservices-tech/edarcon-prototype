import { rfqsRepo } from "./store";
import type { RFQSource, RFQStatus } from "./types";

export async function createPublicRFQ(input: {
  name: string;
  email: string;
  phone: string;
  company: string;
  service: string;
  source: RFQSource;
  language: "en" | "ar";
  message: { en: string; ar: string };
}): Promise<string> {
  const existing = await rfqsRepo.list();
  const year = new Date().getFullYear();
  const referenceNo = `RFQ-${year}-${String(existing.length + 1).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const status: RFQStatus = "new";
  await rfqsRepo.create(
    {
      referenceNo,
      name: input.name,
      email: input.email,
      phone: input.phone,
      company: input.company,
      service: input.service,
      source: input.source,
      language: input.language,
      message: input.message,
      status,
      assignedTo: undefined,
      followUpDate: undefined,
      timeline: [
        {
          id: crypto.randomUUID(),
          status,
          changedBy: "public",
          changedAt: now,
          note: "Submitted via website",
        },
      ],
      notes: [],
    },
    "public"
  );
  return referenceNo;
}

import { z } from "zod";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const WESTERN = "0123456789";

export function convertArabicIndicDigits(value: string): string {
  return value.split("").map((ch) => {
    const idx = ARABIC_INDIC.indexOf(ch);
    return idx === -1 ? ch : WESTERN[idx];
  }).join("");
}

export function cleanPhone(value: string): string {
  return convertArabicIndicDigits(value).replace(/[\s\-\(\)]/g, "");
}

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: "validation.nameTooShort" })
  .max(60, { message: "validation.nameTooLong" })
  .regex(/^[\p{L}\s\-]+$/u, { message: "validation.nameInvalid" });

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email({ message: "validation.emailInvalid" });

export const phoneSchema = z
  .string()
  .refine(
    (value) => /^\+?\d{8,15}$/.test(cleanPhone(value)),
    { message: "validation.phoneInvalid" }
  );

export const detailsSchema = z
  .string()
  .trim()
  .max(500, { message: "validation.detailsTooLong" });

export type ValidatedName = z.infer<typeof nameSchema>;
export type ValidatedEmail = z.infer<typeof emailSchema>;
export type ValidatedPhone = z.infer<typeof phoneSchema>;
export type ValidatedDetails = z.infer<typeof detailsSchema>;

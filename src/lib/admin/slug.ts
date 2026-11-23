export function generateUniqueSlug(
  name: string,
  existingSlugs: readonly string[],
  currentSlug?: string,
): string {
  if (currentSlug) return currentSlug;

  const baseSlug =
    name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item";
  const usedSlugs = new Set(existingSlugs);

  if (!usedSlugs.has(baseSlug)) return baseSlug;

  let suffix = 2;
  while (usedSlugs.has(`${baseSlug}-${suffix}`)) suffix += 1;
  return `${baseSlug}-${suffix}`;
}

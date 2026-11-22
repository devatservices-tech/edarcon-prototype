"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  sourceName?: string;
}

export function SlugInput({ value, onChange, sourceName }: SlugInputProps) {
  const [slug, setSlug] = useState(value);

  useEffect(() => {
    if (sourceName) {
      const generated = sourceName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
      onChange(generated);
    }
  }, [sourceName, onChange]);

  return (
    <Input
      value={slug}
      onChange={(e) => setSlug(e.target.value)}
      onBlur={() => onChange(slug)}
      placeholder="slug"
      className="text-sm"
    />
  );
}

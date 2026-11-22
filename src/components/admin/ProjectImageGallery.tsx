"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, ArrowDown, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveFile, getFileUrl, removeFile, revokeFileUrl, type StoredFile } from "@/lib/admin/files";
import { cn } from "@/lib/utils";
import { BilingualField } from "./BilingualField";
import { Input } from "@/components/ui/input";

interface GalleryItem extends StoredFile {
  previewUrl?: string | null;
  caption: { en: string; ar: string };
  fileId: string;
  order: number;
}

interface ProjectImageGalleryProps {
  value: { id: string; fileId: string; caption: { en: string; ar: string }; order: number }[];
  onChange: (value: { id: string; fileId: string; caption: { en: string; ar: string }; order: number }[]) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function ProjectImageGallery({
  value,
  onChange,
  accept = "image/*",
  maxSizeMB = 5,
}: ProjectImageGalleryProps) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<GalleryItem[]>([]);
  itemsRef.current = items;

  // Revoke object URLs (and free blob memory) when the gallery unmounts.
  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        revokeFileUrl(item.fileId);
      }
    };
  }, []);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const f = fileList[0];
    if (f.size > (maxSizeMB ?? 5) * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB} MB limit`);
      return;
    }
    setError(null);
    (async () => {
      try {
        const saved = await saveFile(f);
        const url = await getFileUrl(saved.id);
        const newItem: GalleryItem = {
          id: crypto.randomUUID(),
          name: f.name,
          type: saved.type,
          size: saved.size,
          savedAt: saved.savedAt,
          fileId: saved.id,
          caption: { en: "", ar: "" },
          order: items.length,
          previewUrl: url || null,
        };
        const next = [...items, newItem];
        setItems(next);
        onChange(
          next.map((i) => ({ id: i.id, fileId: i.fileId, caption: i.caption, order: i.order })),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    })();
  };

  const removeImage = (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) removeFile(item.fileId).catch(() => {});
    setItems(items.filter((i) => i.id !== id));
    onChange(
      items
        .filter((i) => i.id !== id)
        .map((i) => ({ id: i.id, fileId: i.fileId, caption: i.caption, order: i.order })),
    );
  };

  const moveImage = (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((i) => i.id === id);
    if (direction === "up" && idx > 0) {
      [items[idx], items[idx - 1]] = [items[idx - 1], items[idx]];
    } else if (direction === "down" && idx < items.length - 1) {
      [items[idx], items[idx + 1]] = [items[idx + 1], items[idx]];
    }
    const next = [...items].map((i, i2) => ({ ...i, order: i2 }));
    setItems(next);
    onChange(next.map((i) => ({ id: i.id, fileId: i.fileId, caption: i.caption, order: i.order })));
  };

  const setCover = (id: string) => {
    const idx = items.findIndex((i) => i.id === id);
    if (idx === -1) return;
    const [moved] = items.splice(idx, 1);
    items.unshift(moved);
    const next = [...items].map((i, i2) => ({ ...i, order: i2 }));
    setItems(next);
    onChange(next.map((i) => ({ id: i.id, fileId: i.fileId, caption: i.caption, order: i.order })));
  };

  const updateCaption = (id: string, field: "en" | "ar", val: string) => {
    const next = items.map((i) =>
      i.id === id ? { ...i, caption: { ...i.caption, [field]: val } } : i,
    );
    setItems(next);
    onChange(next.map((i) => ({ id: i.id, fileId: i.fileId, caption: i.caption, order: i.order })));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors min-h-[200px]",
        dragging ? "bg-brand-blue/10 border-brand-blue" : "bg-muted/50 border-border hover:bg-muted/70 hover:border-border/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {items.length > 0 ? (
        <div className="w-full space-y-3">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-medium text-muted-foreground uppercase">
              Gallery ({items.length})
            </span>
            <button
              onClick={() => inputRef.current?.click()}
              className="text-xs text-brand-blue hover:text-brand-blue-dark underline"
            >
              Add images
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => {
              const isCover = items[0]?.id === item.id;
              return (
                <div
                  key={item.id}
                  className="relative group rounded-lg overflow-hidden border border-border bg-background"
                >
                  {item.previewUrl ? (
                    <img
                      src={item.previewUrl}
                      alt="preview"
                      className="w-full h-24 object-cover"
                    />
                  ) : (
                    <div className="w-full h-24 flex items-center justify-center bg-muted text-muted-foreground">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!isCover && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCover(item.id);
                        }}
                        className="p-1 rounded bg-background/90 text-foreground hover:bg-brand-blue text-white"
                        title="Set as cover"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(item.id);
                      }}
                      className="p-1 rounded bg-background/90 text-destructive hover:bg-destructive hover:text-white"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {items.indexOf(item) > 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(item.id, "up");
                        }}
                        className="p-1 rounded bg-background/90 text-foreground hover:bg-brand-blue text-white"
                        title="Move up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    {items.indexOf(item) < items.length - 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          moveImage(item.id, "down");
                        }}
                        className="p-1 rounded bg-background/90 text-foreground hover:bg-brand-blue text-white"
                        title="Move down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {isCover && (
                    <div className="absolute top-1 right-1 bg-brand-blue text-white text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </div>
                  )}
                  <div className="p-2">
                    <BilingualField
                      value={item.caption}
                      onChange={(field, val) => updateCaption(item.id, field, val)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground mb-3">
            <ImageIcon className="w-5 h-5" />
          </div>
          <p className="text-sm text-muted-foreground">Drag & drop images or click to upload</p>
          <p className="text-xs text-muted-foreground">Max {maxSizeMB} MB per image</p>
          <button
            onClick={() => inputRef.current?.click()}
            className="mt-3 text-xs font-medium text-brand-blue hover:text-brand-blue-dark underline"
          >
            Browse files
          </button>
        </>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
    </div>
  );
}

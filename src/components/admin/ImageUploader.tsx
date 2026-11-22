"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, RefreshCw, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saveFile, getFileUrl, removeFile, revokeFileUrl, type StoredFile } from "@/lib/admin/files";

interface ImageUploaderProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUploader({ value, onChange, accept = "image/*", maxSizeMB = 5 }: ImageUploaderProps) {
  const [file, setFile] = useState<StoredFile | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      (async () => {
        const url = await getFileUrl(value);
        setPreviewUrl(url || null);
        setFile({ id: value, name: "", type: "", size: 0, savedAt: "" });
      })();
    } else {
      setPreviewUrl(null);
      setFile(null);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (file?.id) {
        revokeFileUrl(file.id);
      }
    };
  }, [file?.id]);

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
        setFile(saved);
        setPreviewUrl(url || null);
        onChange(saved.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    })();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = () => {
    if (file?.id) {
      removeFile(file.id).catch(() => {});
    }
    setFile(null);
    setPreviewUrl(null);
    onChange(undefined);
    inputRef.current!.value = "";
  };

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors min-h-[200px]",
        dragging
          ? "bg-brand-blue/10 border-brand-blue"
          : "bg-muted/50 border-border hover:bg-muted/70 hover:border-border/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {file ? (
        <div className="relative flex flex-col items-center gap-3">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="preview"
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
          )}
          <button
            onClick={() => {
              inputRef.current!.click();
            }}
            className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-dark"
          >
            <RefreshCw className="w-4 h-4" /> Replace image
          </button>
          <button onClick={removeImage} className="text-sm text-destructive hover:text-destructive/80">
            <Trash2 className="w-4 h-4 inline" /> Remove
          </button>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground mb-3">
            <ImageIcon className="w-5 h-5" />
          </div>
          <Plus className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">Drag & drop an image or click to upload</p>
          <p className="text-xs text-muted-foreground">Max {maxSizeMB} MB · {accept}</p>
          <button
            onClick={() => inputRef.current!.click()}
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

"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFile, saveFile, type StoredFile } from "@/lib/admin/files";

interface ServiceDocumentUploaderProps {
  value?: string;
  onChange: (value: string | undefined, file?: StoredFile) => void;
  documentLabel?: string;
  maxSizeMB?: number;
}

export function ServiceDocumentUploader({
  value,
  onChange,
  documentLabel = "service document",
  maxSizeMB = 5,
}: ServiceDocumentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<StoredFile | null>(null);
  const [externalUrl, setExternalUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadFile() {
      setError(null);
      setFile(null);
      setExternalUrl(null);
      if (!value) return;

      if (/^https?:\/\//i.test(value)) {
        setExternalUrl(value);
        return;
      }

      try {
        const stored = await getFile(value);
        if (!cancelled) setFile(stored ?? null);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load the document.");
        }
      }
    }

    void loadFile();
    return () => {
      cancelled = true;
    };
  }, [value]);

  const handleFile = async (selected: File | undefined) => {
    if (!selected) return;
    if (
      selected.type !== "application/pdf" &&
      !selected.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF document.");
      return;
    }
    if (selected.size > maxSizeMB * 1024 * 1024) {
      setError(`The PDF must be ${maxSizeMB} MB or smaller.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const saved = await saveFile(selected);
      setFile(saved);
      setExternalUrl(null);
      onChange(saved.id, saved);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Document upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const documentName =
    file?.name ||
    (externalUrl ? externalUrl.split("/").pop()?.split("?")[0] : null) ||
    (value ? "Attached document" : null);

  return (
    <div
      onDragEnter={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        event.preventDefault();
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false);
        }
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        void handleFile(event.dataTransfer.files[0]);
      }}
      className={`relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
        dragging
          ? "border-brand-blue bg-brand-blue/10"
          : "border-border bg-muted/50 hover:border-border/50 hover:bg-muted/70"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />
      {documentName ? (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-card p-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">{documentName}</p>
              <p className="text-xs text-muted-foreground">
                {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : documentLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-dark disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading…" : "Replace file"}
            </button>
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setExternalUrl(null);
                onChange(undefined);
              }}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <FileText className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          Drag & drop a PDF or click to upload
        </p>
      )}
      {!documentName && (
        <>
          <p className="mt-1 text-xs text-muted-foreground">PDF · Max {maxSizeMB} MB</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="mt-3"
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Choose PDF"}
          </Button>
        </>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

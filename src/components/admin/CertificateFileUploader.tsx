"use client";

import { useRef, useState } from "react";
import { Download, FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveFile } from "@/lib/admin/files";
import { cn } from "@/lib/utils";

interface CertificateFileUploaderProps {
  value?: string;
  versions: { id: string; fileId: string; fileName: string; fileSize: number; uploadedAt: string; uploadedBy: string }[];
  onChange: (value: { fileId?: string; fileName?: string; fileSize?: number } & Partial<{
    versions: { id: string; fileId: string; fileName: string; fileSize: number; uploadedAt: string; uploadedBy: string }[];
  }>) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function CertificateFileUploader({
  value,
  versions,
  onChange,
  accept = "application/pdf,image/*",
  maxSizeMB = 5,
}: CertificateFileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) return;

    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|gif|webp|svg)$/i.test(file.name);
    if (!isPdf && !isImage) {
      setError("Please select a PDF or image file.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB} MB limit.`);
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const saved = await saveFile(file);
      const version = {
        id: crypto.randomUUID(),
        fileId: saved.id,
        fileName: saved.name,
        fileSize: saved.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: "admin",
      };
      onChange({
        fileId: saved.id,
        fileName: saved.name,
        fileSize: saved.size,
        versions: [...versions, version],
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const currentVersion = versions.find((version) => version.fileId === value);

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void handleFiles(e.dataTransfer.files);
      }}
      className={cn(
        "relative flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-colors",
        dragging ? "bg-brand-blue/10 border-brand-blue" : "bg-muted/50 border-border hover:bg-muted/70 hover:border-border/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => void handleFiles(event.target.files)}
      />
      {value ? (
        <div className="flex w-full flex-col items-center gap-3">
          <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-card p-3 text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue/10 text-brand-blue">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {currentVersion?.fileName || "Selected certificate file"}
              </p>
              <p className="text-xs text-muted-foreground">
                {currentVersion ? `${(currentVersion.fileSize / 1024 / 1024).toFixed(2)} MB` : "Certificate file"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-dark disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> {uploading ? "Uploading…" : "Replace file"}
            </button>
            <button
              type="button"
              onClick={() => onChange({ fileId: undefined, fileName: undefined, fileSize: undefined })}
              className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-sm text-muted-foreground">Drag & drop a PDF or image, or click to upload</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF or image · Max {maxSizeMB} MB</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {uploading ? "Uploading…" : "Choose file"}
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      {versions.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">File versions ({versions.length})</p>
          <div className="space-y-1">
            {versions.slice().reverse().map((v) => (
              <div key={v.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-border/50 bg-muted/30 text-xs">
                <div className="flex items-center gap-2">
                  <Download className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{v.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{new Date(v.uploadedAt).toLocaleDateString()}</span>
                  <span className="text-[10px] text-muted-foreground">by {v.uploadedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

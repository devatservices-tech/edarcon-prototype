"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveFile, getFileUrl, removeFile, type StoredFile } from "@/lib/admin/files";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

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
  maxSizeMB = 10,
}: CertificateFileUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const f = fileList[0];
    if (f.size > (maxSizeMB ?? 10) * 1024 * 1024) {
      setError(`File exceeds ${maxSizeMB} MB limit`);
      return;
    }
    setError(null);
    (async () => {
      try {
        const saved = await saveFile(f);
        const url = await getFileUrl(saved.id);
        onChange({
          fileId: saved.id,
          fileName: f.name,
          fileSize: f.size,
          versions: [
            ...versions,
            {
              id: crypto.randomUUID(),
              fileId: saved.id,
              fileName: f.name,
              fileSize: f.size,
              uploadedAt: new Date().toISOString(),
              uploadedBy: "admin",
            },
          ],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    })();
  };

  const removeFile = async (fileId: string) => {
    try {
      await removeFile(fileId);
    } catch {}
    onChange({ fileId: undefined, fileName: undefined, fileSize: undefined });
  };

  const replaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const currentFileId = value || (versions[versions.length - 1]?.fileId);
  const currentVersion = versions[versions.length - 1];

  return (
    <div
      onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setDragging(false); }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
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
        onChange={replaceFile}
      />
      {currentFileId ? (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{currentVersion?.fileName || "File"}</span>
            <span className="text-xs text-muted-foreground">{((currentVersion?.fileSize || 0) / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                inputRef.current?.click();
              }}
              className="flex items-center gap-2 text-sm font-medium text-brand-blue hover:text-brand-blue-dark"
            >
              <RefreshCw className="w-4 h-4" /> Replace file
            </button>
            <button
              onClick={() => removeFile(currentFileId)}
              className="text-sm text-destructive hover:text-destructive/80"
            >
              <Trash2 className="w-4 h-4 inline" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-muted text-muted-foreground mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm text-muted-foreground">Drag & drop a PDF or image, or click to upload</p>
          <p className="text-xs text-muted-foreground">Max {maxSizeMB} MB</p>
            <button
              onClick={() => inputRef.current?.click()}
              className="mt-3 text-xs font-medium text-brand-blue hover:text-brand-blue-dark underline"
          >
            Browse files
          </button>
        </>
      )}
      {error && <p className="text-xs text-destructive mt-2">{error}</p>}
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

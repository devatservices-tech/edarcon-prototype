import { createStore, set, get, del, keys } from "idb-keyval";

const fileStore = createStore("edarcon-admin-files", "files");

// Track created object URLs so they can be revoked and blobs freed.
// Without this, every getFileUrl() call leaks a blob URL for the page lifetime.
const objectUrls = new Map<string, string>();

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.85;

export interface StoredFile {
  id: string;
  name: string;
  type: string;
  size: number;
  savedAt: string;
}

interface FileRecord extends StoredFile {
  blob: Blob;
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.Blob !== "undefined";
}

function resizeImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const max = Math.max(width, height);
      if (max > MAX_IMAGE_DIMENSION) {
        const scale = MAX_IMAGE_DIMENSION / max;
        width = width * scale;
        height = height * scale;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas rendering context unavailable"));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Image encoding failed"));
          else resolve(blob);
        },
        mime,
        IMAGE_QUALITY,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to decode image"));
    };
    img.src = objectUrl;
  });
}

export async function saveFile(file: File): Promise<StoredFile> {
  if (!isBrowser()) throw new Error("File storage is only available in the browser");
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File "${file.name}" exceeds the 5 MB limit`);
  }

  let blob: Blob = file;
  if (file.type.startsWith("image/")) {
    blob = await resizeImage(file);
  }

  const id = crypto.randomUUID();
  const record: FileRecord = {
    id,
    name: file.name,
    type: blob.type,
    size: blob.size,
    savedAt: new Date().toISOString(),
    blob,
  };
  await set(id, record, fileStore);

  return {
    id,
    name: file.name,
    type: blob.type,
    size: blob.size,
    savedAt: record.savedAt,
  };
}

export async function getFile(id: string): Promise<StoredFile | undefined> {
  if (!isBrowser()) return undefined;
  const record = await get<FileRecord>(id, fileStore);
  if (!record) return undefined;
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    size: record.size,
    savedAt: record.savedAt,
  };
}

export async function getFileUrl(id: string): Promise<string | undefined> {
  if (!isBrowser()) return undefined;
  const existing = objectUrls.get(id);
  if (existing) return existing;
  const record = await get<FileRecord>(id, fileStore);
  if (!record) return undefined;
  const url = URL.createObjectURL(record.blob);
  objectUrls.set(id, url);
  return url;
}

export function revokeFileUrl(id: string): void {
  const url = objectUrls.get(id);
  if (url) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore
    }
    objectUrls.delete(id);
  }
}

export async function removeFile(id: string): Promise<boolean> {
  revokeFileUrl(id);
  await del(id, fileStore);
  return true;
}

export async function listFiles(): Promise<StoredFile[]> {
  if (!isBrowser()) return [];
  const ids = await keys<string>(fileStore);
  const files: StoredFile[] = [];
  for (const id of ids) {
    const file = await getFile(id);
    if (file) files.push(file);
  }
  return files;
}

export async function clearAllFiles(): Promise<void> {
  if (!isBrowser()) return;
  const ids = await keys<string>(fileStore);
  for (const id of ids) {
    revokeFileUrl(id);
    await del(id, fileStore);
  }
  objectUrls.clear();
}

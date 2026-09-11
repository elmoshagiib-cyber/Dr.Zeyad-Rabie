export interface UploadResult {
  url: string;
  key: string;
}

export type ProgressCallback = (loadedBytes: number, totalBytes: number) => void;

export class UploadCancelledError extends Error {
  constructor() {
    super("Upload cancelled");
    this.name = "UploadCancelledError";
  }
}

export async function uploadToR2(
  file: File,
  folder = "uploads",
  onProgress?: ProgressCallback,
  signal?: AbortSignal
): Promise<UploadResult> {
  if (signal?.aborted) {
    throw new UploadCancelledError();
  }

  // اطلب رابط الرفع من الـ API
  const response = await fetch("/api/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder,
    }),
    signal,
  });

  if (!response.ok) {
    throw new Error("Failed to generate upload URL");
  }

  const { uploadUrl, publicUrl, key } = await response.json();

  // ارفع الملف مباشرة إلى Cloudflare R2 مع تتبع التقدم الحقيقي
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded, event.total);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Failed to upload file (status ${xhr.status})`));
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error during upload"));
    };

    xhr.onabort = () => {
      reject(new UploadCancelledError());
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort());
    }

    xhr.send(file);
  });

  return {
    url: publicUrl,
    key,
  };
}
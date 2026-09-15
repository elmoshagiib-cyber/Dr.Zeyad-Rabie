export interface UploadResult {
  url: string;
  key: string;
}

export type ProgressCallback = (
  loadedBytes: number,
  totalBytes: number
) => void;

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

  // ==========================================
  // 1. الحصول على Supabase Session
  // ==========================================
  const { supabase } = await import("./supabase");

  let {
    data: { session },
  } = await supabase.auth.getSession();

  // لو الـ Session مش موجودة، نحاول نعمل Refresh
  if (!session?.access_token) {
    const { data: refreshed } = await supabase.auth.refreshSession();
    session = refreshed.session;
  }

  if (!session?.access_token) {
    throw new Error("Authentication required");
  }

  // ==========================================
  // 2. طلب Signed Upload URL من الـ API
  // ==========================================
  const response = await fetch("/api/upload-url", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      fileName: file.name,
      fileType: file.type,
      folder,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);

    if (response.status === 401) {
      throw new Error("انتهت جلسة الدخول، برجاء تسجيل الدخول مرة أخرى");
    }

    if (response.status === 403) {
      throw new Error("غير مسموح لك برفع الملفات");
    }

    throw new Error(
      errorData?.error || "Failed to generate upload URL"
    );
  }

  const { uploadUrl, publicUrl, key } = await response.json();

  if (!uploadUrl || !key) {
    throw new Error("Invalid upload URL response");
  }

  // ==========================================
  // 3. رفع الملف مباشرة إلى Cloudflare R2
  // ==========================================
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
        reject(
          new Error(
            `Failed to upload file (status ${xhr.status})`
          )
        );
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

      signal.addEventListener(
        "abort",
        () => xhr.abort(),
        { once: true }
      );
    }

    xhr.send(file);
  });

  // ==========================================
  // 4. النتيجة
  // ==========================================
  return {
    url: publicUrl,
    key,
  };
}
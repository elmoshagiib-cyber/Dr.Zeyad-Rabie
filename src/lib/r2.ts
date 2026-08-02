export interface UploadResult {
  url: string;
  key: string;
}

export type ProgressCallback = (loadedBytes: number, totalBytes: number) => void;

export async function uploadToR2(
  file: File,
  folder = "uploads",
  onProgress?: ProgressCallback
): Promise<UploadResult> {
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

    console.log("========== UPLOAD ==========");
console.log("NAME =", file.name);
console.log("TYPE =", file.type);
console.log("SIZE =", file.size);
console.log(file);

    xhr.send(file);
  });

  return {
    url: publicUrl,
    key,
  };
}
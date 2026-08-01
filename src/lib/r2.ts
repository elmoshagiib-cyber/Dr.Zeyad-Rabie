export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadToR2(
  file: File,
  folder = "uploads"
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

  // ارفع الملف مباشرة إلى Cloudflare R2
  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file");
  }

  return {
    url: publicUrl,
    key,
  };
}
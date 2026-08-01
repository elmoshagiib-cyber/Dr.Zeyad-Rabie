export interface UploadResult {
  url: string;
  key: string;
}

export async function uploadToR2(
  file: File,
  folder = "uploads"
): Promise<UploadResult> {
  console.log("1- Requesting signed url");

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

  console.log("2- API Status:", response.status);

  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error("Failed to generate upload URL");
  }

  const { uploadUrl, publicUrl, key } = await response.json();

  console.log("3- Signed URL:", uploadUrl);

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": file.type,
    },
    body: file,
  });

  console.log("4- Upload Status:", uploadResponse.status);

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    console.error("Upload Error:", text);
    throw new Error("Failed to upload file");
  }

  console.log("5- Done");

  return {
    url: publicUrl,
    key,
  };
}
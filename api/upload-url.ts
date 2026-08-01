import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileType, folder = "uploads" } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "Missing fileName or fileType",
      });
    }

    const key = `${folder}/${Date.now()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });
console.log("R2_ENDPOINT =", process.env.R2_ENDPOINT);
console.log("R2_BUCKET_NAME =", process.env.R2_BUCKET_NAME);
console.log("R2_PUBLIC_URL =", process.env.R2_PUBLIC_URL);
    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 5,
    });
console.log("UPLOAD URL =", uploadUrl);
    return res.status(200).json({
      uploadUrl,
      key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to generate upload URL",
    });
  }
}
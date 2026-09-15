import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // ================================
    // 1. التحقق من تسجيل الدخول
    // ================================
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const token = authHeader.replace("Bearer ", "").trim();

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // ================================
    // 2. التحقق من Supabase Session
    // ================================
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // ================================
    // 3. التحقق أن المستخدم Instructor
    // ================================
    const { data: instructor, error: instructorError } = await supabase
      .from("instructors")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (instructorError || !instructor) {
      return res.status(403).json({
        error: "Forbidden",
      });
    }

    // ================================
    // 4. بيانات الملف
    // ================================
    const {
      fileName,
      fileType,
      folder = "uploads",
    } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "Missing fileName or fileType",
      });
    }

    // ================================
    // 5. إنشاء Key للملف
    // ================================
    const key = `${folder}/${Date.now()}-${fileName}`;

    // ================================
    // 6. إنشاء Signed Upload URL
    // ================================
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 5,
    });

    // ================================
    // 7. إرسال البيانات
    // ================================
    return res.status(200).json({
      uploadUrl,
      key,
      publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
    });

  } catch (error) {
    console.error("UPLOAD URL ERROR:", error);

    return res.status(500).json({
      error: "Failed to generate upload URL",
    });
  }
}
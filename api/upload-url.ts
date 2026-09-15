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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_COURSE_FOLDERS = new Set([
  "course-videos",
  "video-thumbnails",
  "homework-instructions",
  "question-images",
]);

function sanitizeFileName(fileName: string) {
  return fileName
    .split(/[\\/]/)
    .pop()!
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 200);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // ==========================================
    // 1. التحقق من Authorization
    // ==========================================
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

    // ==========================================
    // 2. التحقق من المستخدم في Supabase Auth
    // ==========================================
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    // ==========================================
    // 3. التحقق أن المستخدم Instructor
    // ==========================================
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

    // ==========================================
    // 4. قراءة بيانات الرفع
    // ==========================================
    const {
      fileName,
      fileType,
      folder,
    } = req.body || {};

    if (!fileName || !fileType || !folder) {
      return res.status(400).json({
        error: "Missing fileName, fileType or folder",
      });
    }

    if (
      typeof fileName !== "string" ||
      typeof fileType !== "string" ||
      typeof folder !== "string"
    ) {
      return res.status(400).json({
        error: "Invalid upload data",
      });
    }

    // ==========================================
    // 5. تنظيف والتحقق من الـ folder
    // ==========================================
    const normalizedFolder = folder.trim().replace(/^\/+|\/+$/g, "");

    // ممنوع path traversal أو backslashes
    if (
      normalizedFolder.includes("..") ||
      normalizedFolder.includes("\\") ||
      normalizedFolder.includes("//")
    ) {
      return res.status(400).json({
        error: "Invalid folder",
      });
    }

    // ==========================================
    // 6. course-thumbnails
    // ==========================================
    if (normalizedFolder === "course-thumbnails") {
      // مسموح للـ instructors فقط
    } else {
      // ==========================================
      // 7. باقي الـ folders لازم تكون:
      //
      // course-videos/{courseId}/{sectionId}
      // video-thumbnails/{courseId}/{sectionId}
      // homework-instructions/{courseId}/{sectionId}
      // question-images/{courseId}/{sectionId}
      // ==========================================

      const parts = normalizedFolder.split("/");

      if (parts.length !== 3) {
        return res.status(403).json({
          error: "Invalid upload folder",
        });
      }

      const [folderType, courseId, sectionId] = parts;

      if (!ALLOWED_COURSE_FOLDERS.has(folderType)) {
        return res.status(403).json({
          error: "Upload folder not allowed",
        });
      }

      if (!UUID_REGEX.test(courseId) || !UUID_REGEX.test(sectionId)) {
        return res.status(400).json({
          error: "Invalid course or section ID",
        });
      }

      // ==========================================
      // 8. التحقق أن الـ Section تابع للكورس
      //    وأن الكورس ملك للـ Instructor الحالي
      // ==========================================
      const { data: section, error: sectionError } = await supabase
        .from("course_sections")
        .select(`
          id,
          course_id,
          courses!inner (
            id,
            teacher_id
          )
        `)
        .eq("id", sectionId)
        .eq("course_id", courseId)
        .eq("courses.teacher_id", instructor.id)
        .single();

      if (sectionError || !section) {
        return res.status(403).json({
          error: "You do not own this course",
        });
      }
    }

    // ==========================================
    // 9. تنظيف اسم الملف
    // ==========================================
    const safeFileName = sanitizeFileName(fileName);

    if (!safeFileName) {
      return res.status(400).json({
        error: "Invalid file name",
      });
    }

    // ==========================================
    // 10. إنشاء R2 Object Key
    // ==========================================
    const key = `${normalizedFolder}/${Date.now()}-${safeFileName}`;

    // ==========================================
    // 11. إنشاء Signed PUT URL
    // ==========================================
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 5,
    });

    // ==========================================
    // 12. إرجاع بيانات الرفع
    // ==========================================
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
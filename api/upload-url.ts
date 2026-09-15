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
    // 2. التحقق من Supabase Auth
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
    // 4. بيانات الرفع
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
    // 5. تنظيف الـ folder
    // ==========================================
    const normalizedFolder = folder
      .trim()
      .replace(/^\/+|\/+$/g, "");

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
      // Instructor authenticated بالفعل
    } else {
      // ==========================================
      // باقي الـ folders:
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

      // ------------------------------------------
      // التحقق من نوع الـ folder
      // ------------------------------------------
      if (!ALLOWED_COURSE_FOLDERS.has(folderType)) {
        return res.status(403).json({
          error: "Upload folder not allowed",
        });
      }

      // ------------------------------------------
      // courseId لازم يكون UUID
      // ------------------------------------------
      if (!UUID_REGEX.test(courseId)) {
        return res.status(400).json({
          error: "Invalid course ID",
        });
      }

      // ==========================================
      // 7. التأكد أن الكورس ملك للـ Instructor
      // ==========================================
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("id, teacher_id")
        .eq("id", courseId)
        .eq("teacher_id", instructor.id)
        .single();

      if (courseError || !course) {
        return res.status(403).json({
          error: "You do not own this course",
        });
      }

      // ==========================================
      // 8. التحقق من الـ Section
      // ==========================================
      //
      // لو sectionId UUID:
      // نتأكد أنه موجود وتابع للكورس.
      //
      // لو مش UUID:
      // فهو temporary ID من الواجهة أثناء إنشاء
      // قسم جديد قبل حفظ الكورس.
      //
      if (UUID_REGEX.test(sectionId)) {
        const { data: section, error: sectionError } =
          await supabase
            .from("course_sections")
            .select("id")
            .eq("id", sectionId)
            .eq("course_id", courseId)
            .single();

        if (sectionError || !section) {
          return res.status(403).json({
            error: "Section does not belong to this course",
          });
        }
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
    // 10. إنشاء R2 Key
    // ==========================================
    const key = `${normalizedFolder}/${Date.now()}-${safeFileName}`;

    // ==========================================
    // 10.5. تحديد الـ Bucket والـ Public URL المناسبين
    //       (صور الأغلفة على bucket عام منفصل)
    // ==========================================
    const isThumbnail = normalizedFolder === "course-thumbnails";

    const targetBucket = isThumbnail
      ? process.env.R2_THUMBNAILS_BUCKET_NAME!
      : process.env.R2_BUCKET_NAME!;

    const targetPublicUrl = isThumbnail
      ? process.env.R2_THUMBNAILS_PUBLIC_URL!
      : process.env.R2_PUBLIC_URL!;

    // ==========================================
    // 11. إنشاء Signed Upload URL
    // ==========================================
    const command = new PutObjectCommand({
      Bucket: targetBucket,
      Key: key,
      ContentType: fileType,
    });

    const uploadUrl = await getSignedUrl(client, command, {
      expiresIn: 60 * 5,
    });

    // ==========================================
    // 12. النتيجة
    // ==========================================
    return res.status(200).json({
      uploadUrl,
      key,
      publicUrl: `${targetPublicUrl}/${key}`,
    });
  } catch (error) {
    console.error("UPLOAD URL ERROR:", error);

    return res.status(500).json({
      error: "Failed to generate upload URL",
    });
  }
}
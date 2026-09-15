import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    // ==========================================
    // 1. Authorization
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
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
    // 2. Supabase Auth
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
    // 3. Instructor
    // ==========================================

    const { data: instructor, error: instructorError } =
      await supabase
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
    // 4. Thumbnail Key + Course ID
    // ==========================================

    const { key, courseId } = req.body || {};

    if (!key || typeof key !== "string") {
      return res.status(400).json({
        error: "Missing thumbnail key",
      });
    }

    // ==========================================
    // 5. منع Path Traversal
    // ==========================================

    if (
      key.includes("..") ||
      key.includes("\\") ||
      key.includes("//")
    ) {
      return res.status(400).json({
        error: "Invalid thumbnail key",
      });
    }

    // ==========================================
    // 6. Video Thumbnail
    // ==========================================

    if (key.startsWith("video-thumbnails/")) {
      const parts = key.split("/");

      if (parts.length < 3) {
        return res.status(400).json({
          error: "Invalid video thumbnail key",
        });
      }

      const videoCourseId = parts[1];

      if (!UUID_REGEX.test(videoCourseId)) {
        return res.status(400).json({
          error: "Invalid course ID",
        });
      }

      // التأكد أن الكورس ملك للـ Instructor
      const { data: course, error: courseError } =
        await supabase
          .from("courses")
          .select("id")
          .eq("id", videoCourseId)
          .eq("teacher_id", instructor.id)
          .single();

      if (courseError || !course) {
        return res.status(403).json({
          error: "You do not own this course",
        });
      }
    }

    // ==========================================
    // 8. أي Folder غير مسموح (course-thumbnails بقت public ومش محتاجة signing)
    // ==========================================

    else {
      return res.status(403).json({
        error: "Invalid thumbnail",
      });
    }

    // ==========================================
    // 9. إنشاء Signed GET URL
    // ==========================================

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: 60 * 10,
    });

    // ==========================================
    // 10. Return
    // ==========================================

    return res.status(200).json({
      url,
    });
  } catch (error) {
    console.error("THUMBNAIL URL ERROR:", error);

    return res.status(500).json({
      error: "Failed to generate thumbnail URL",
    });
  }
}
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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed",
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Unauthorized - Invalid token",
      });
    }

    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({
        error: "Missing lessonId",
      });
    }

    const { data: lesson, error: lessonError } = await supabase
      .from("course_items")
      .select("id, storage_path, section_id")
      .eq("id", lessonId)
      .single();
;
    if (lessonError || !lesson) {
      return res.status(404).json({
        error: "Lesson not found",
      });
    }

    if (!lesson.storage_path) {
      return res.status(404).json({
        error: "Video not available",
      });
    }

    const { data: section, error: sectionError } = await supabase
      .from("course_sections")
      .select("course_id")
      .eq("id", lesson.section_id)
      .single();

    if (sectionError || !section) {
      return res.status(404).json({
        error: "Course not found",
      });
    }

    const courseId = section.course_id;

    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (studentsError || !students) {
      return res.status(403).json({
        error: "Student profile not found",
      });
    }

    const studentId = students.id;

    const { data: enrollment, error: enrollmentError } = await supabase
      .from("student_courses")
      .select("id, active")
      .eq("student_id", studentId)
      .eq("course_id", courseId)
      .eq("active", true)
      .single();

    if (enrollmentError || !enrollment) {
      return res.status(403).json({
        error: "Forbidden - Not enrolled in this course",
      });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: lesson.storage_path,
    });

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: 300,
    });

    return res.status(200).json({
      url: signedUrl,
    });
} catch (err: any) {
  console.error("========== VIDEO API ERROR ==========");
  console.error(err);
  console.error("MESSAGE:", err?.message);
  console.error("STACK:", err?.stack);
  console.error("CAUSE:", err?.cause);

  return res.status(500).json({
    success: false,
    message: err?.message || "Unknown error",
    stack: err?.stack || null,
  });
}
}
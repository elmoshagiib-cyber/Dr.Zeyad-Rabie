
import { useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Section } from "../../types/course";

export function CreateCourse() {
  const navigate = useNavigate();
const [sections, setSections] = useState<any[]>([]);

const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
const [openedSection, setOpenedSection] = useState<number | null>(null);
const [builderType, setBuilderType] =
useState<"homework" | "exam" | null>(null);
type Question = {
id:number;
type:"mcq"|"truefalse"|"essay";
question:string;
options?:string[];
correct?:number|boolean;
};
const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
const [previewTitle, setPreviewTitle] = useState("");
const [showPreview, setShowPreview] = useState(false);
const [savedHomework,setSavedHomework]=useState<any[]>([]);
const [savedExam,setSavedExam]=useState<any[]>([]);
const [questions,setQuestions]=useState<Question[]>([
{
id:Date.now(),
type:"mcq",
question:"",
options:["","","",""],
correct:0,
},
]);

const [newSectionTitle, setNewSectionTitle] = useState("");
const [newLessonTitle, setNewLessonTitle] = useState("");
const [courseTitle, setCourseTitle] = useState("");
const [courseDescription, setCourseDescription] = useState("");
const [coursePrice, setCoursePrice] = useState("");
const [courseGrade, setCourseGrade] = useState("");
const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
const addSection = () => {
  setSections([
    ...sections,
    {
      id: crypto.randomUUID(),
      title:
        newSectionTitle.trim() ||
        `الباب ${sections.length + 1}`,
      lessons: [],
    },
  ]);

  setNewSectionTitle("");
};

const addLesson = (
  sectionId: string,
  lesson: any
) => {
  setSections((prev) =>
    prev.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: [...section.lessons, lesson],
          }
        : section
    )
  );
};
        
const deleteSection = (sectionId: string) => {
  setSections(
    sections.filter(
      (section) => section.id !== sectionId
    )
  );
};
const deleteLesson = (
  sectionId: string,
  lessonIndex: number
) => {
  setSections(
    sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.filter(
              (_: any, index: number) =>
                index !== lessonIndex
            ),
          }
        : section
    )
  );
};
const publishCourse = async () => {
  console.log("publish clicked");

  if (
    !courseTitle ||
    !courseDescription ||
    !coursePrice ||
    !courseGrade ||
    !thumbnailFile
  ) {
    alert("اكمل جميع بيانات الكورس");
    return;
  }

  try {
    const courseId = `c${Date.now()}`;
let thumbnailUrl = "";

if (thumbnailFile) {
  const fileExt = thumbnailFile.name.split(".").pop();

  const fileName = `${Date.now()}.${fileExt}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-thumbnails")
      .upload(fileName, thumbnailFile);

  if (!uploadError) {
    const { data } = supabase.storage
      .from("course-thumbnails")
      .getPublicUrl(fileName);

    thumbnailUrl = data.publicUrl;
    console.log("COURSE DATA =", {
  id: courseId,
  title: courseTitle,
  thumbnail: thumbnailUrl,
});
  }
}
const { error: courseError } = await supabase
  .from("courses")
  .insert({
    id: courseId,
    title: courseTitle,
    description: courseDescription,
    thumbnail: thumbnailUrl,
    grade: courseGrade,
    price: Number(coursePrice),
  });
  

if (courseError) {
  console.log("COURSE ERROR", courseError);
  alert(courseError.message);
  return;
  
}

    // 2- حفظ الأقسام والدروس
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];

      const { data: lectureData, error: lectureError } =
        await supabase
          .from("course_lectures")
          .insert({
            course_id: courseId,
            title: section.title,
            sort_order: i + 1,
          })
          .select()
          .single();

      if (lectureError) {
  console.log("LECTURE ERROR", lectureError);
  alert(JSON.stringify(lectureError));
  return;
}

      const lectureId = lectureData.id;

      // حفظ الدروس
      for (const lesson of section.lessons) {
let videoUrl = "";
let fileUrl = "";

if (lesson.videoFile) {
  const ext =
    lesson.videoFile.name.split(".").pop();

  const fileName =
    `${Date.now()}-${Math.random()}.${ext}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-videos")
      .upload(fileName, lesson.videoFile);

  if (uploadError) {
    console.log(uploadError);
    continue;
  }

  const { data } = supabase.storage
    .from("course-videos")
    .getPublicUrl(fileName);

  videoUrl = data.publicUrl;

  await supabase
    .from("lecture_videos")
    .insert({
      lecture_id: lectureId,
      title: lesson.title,
      video_url: videoUrl,
    });
}

if (lesson.pdfFile) {
  const ext =
    lesson.pdfFile.name.split(".").pop();

  const fileName =
    `${Date.now()}-${Math.random()}.${ext}`;

  const { error: uploadError } =
    await supabase.storage
      .from("course-files")
      .upload(fileName, lesson.pdfFile);

  if (uploadError) {
    console.log(uploadError);
    continue;
  }

  const { data } = supabase.storage
    .from("course-files")
    .getPublicUrl(fileName);

  fileUrl = data.publicUrl;

  await supabase
    .from("lecture_files")
    .insert({
      lecture_id: lectureId,
      title: lesson.title,
      file_url: fileUrl,
    });
}
      }
      
    }

    alert("تم إنشاء الكورس بنجاح");
    navigate("/instructor/courses");

  } catch (err) {
    console.error(err);
    alert("حدث خطأ");
  }
};

return (
<div
className="flex min-h-screen bg-slate-50"
dir="rtl"
>

<div className="hidden lg:block">
<DashboardSidebar type="instructor" />
</div>

<main className="flex-1 overflow-y-auto">
  


</main>

</div>
);

}
    
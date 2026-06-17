import { useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { Plus, BookOpen, Save, Upload } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";

export function CreateCourse() {
  const navigate = useNavigate();
 const [sections, setSections] = useState([
  
  {
    id: 1,
    title: "القسم الأول",
    lessons: [
      {
        title: "الدرس الأول",
        videoUrl: "",
        pdfUrl: "",
      },
    ],
  },
]);

const [newSectionTitle, setNewSectionTitle] = useState("");
const [newLessonTitle, setNewLessonTitle] = useState("");
const [newVideoUrl, setNewVideoUrl] = useState("");
const [newPdfUrl, setNewPdfUrl] = useState("");
const [courseTitle, setCourseTitle] = useState("");
const [courseDescription, setCourseDescription] = useState("");
const [coursePrice, setCoursePrice] = useState("");
const [courseGrade, setCourseGrade] = useState("");
const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const addSection = () => {
  if (!newSectionTitle.trim()) return;

  setSections([
    ...sections,
    {
      id: Date.now(),
      title: newSectionTitle,
      lessons: [],
    },
  ]);

  setNewSectionTitle("");
};
const addLesson = (sectionId: number) => {
  if (!newLessonTitle.trim()) return;

  setSections(
    sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: [
              ...section.lessons,
              {
                title: newLessonTitle,
                videoUrl: newVideoUrl,
                pdfUrl: newPdfUrl,
              },
            ],
          }
        : section
    )
  );

  setNewLessonTitle("");
  setNewVideoUrl("");
  setNewPdfUrl("");
};
const deleteLesson = (sectionId: number, lessonIndex: number) => {
  setSections(
    sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.filter(
              (_, index) => index !== lessonIndex
            ),
          }
        : section
    )
  );
};
const deleteSection = (sectionId: number) => {
  setSections(
    sections.filter((section) => section.id !== sectionId)
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
    console.log("IMAGE URL =", thumbnailUrl);
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

        if (lesson.videoUrl) {
  const { error: videoError } = await supabase
    .from("lecture_videos")
    .insert({
      lecture_id: lectureId,
      title: lesson.title,
      video_url: lesson.videoUrl,
    });

  if (videoError) {
    console.log("VIDEO ERROR", videoError);
    alert(JSON.stringify(videoError));
    return;
  }
} // <-- القوس ده ناقص

if (lesson.pdfUrl) {
  const { error: fileError } = await supabase
    .from("lecture_files")
    .insert({
      lecture_id: lectureId,
      title: lesson.title,
      file_url: lesson.pdfUrl,
    });

  if (fileError) {
  console.log("FILE ERROR", fileError);
  alert(JSON.stringify(fileError));
  return;
}

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

    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white dark:bg-[#130726] border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">
            إنشاء كورس جديد
          </h1>
          <p className="text-slate-500 text-sm">
            قم بإضافة بيانات الكورس والمحتوى التعليمي
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-black text-lg">
                بيانات الكورس
              </h2>

              <Input
  label="اسم الكورس"
  placeholder="مثال: كيمياء الصف الثالث الثانوي"
  value={courseTitle}
  onChange={(e) => setCourseTitle(e.target.value)}
/>

<Input
  label="السعر"
  value={coursePrice}
  onChange={(e) => setCoursePrice(e.target.value)}
  placeholder="450"
/>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  وصف الكورس
                </label>

                <textarea
  rows={4}
  value={courseDescription}
  onChange={(e) => setCourseDescription(e.target.value)}
  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
  placeholder="اكتب وصف الكورس..."
/>
              </div>

              <div className="grid md:grid-cols-2 gap-4">

  <Select
  label="الصف الدراسي"
  value={courseGrade}
  onChange={(e) => setCourseGrade(e.target.value)}
>
  <option value="">
    اختر الصف الدراسي
  </option>

  <option value="first_sec">
    الصف الأول الثانوي
  </option>

  <option value="second_sec">
    الصف الثاني الثانوي
  </option>

  <option value="third_sec">
    الصف الثالث الثانوي
  </option>
</Select>

</div>

              <div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    صورة الكورس
  </label>

  <input
    type="file"
    accept="image/*"
    id="thumbnail-upload"
    className="hidden"
    onChange={(e) => {
      if (e.target.files?.[0]) {
        setThumbnailFile(e.target.files[0]);
      }
    }}
  />

  <input
  type="file"
  accept="image/*"
  id="thumbnail-upload"
  className="hidden"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  }}
/>

<label
  htmlFor="thumbnail-upload"
  className="
    inline-flex
    items-center
    gap-2
    px-4
    py-2
    border
    rounded-xl
    cursor-pointer
  "
>
  <Upload size={16} />
  
  رفع صورة
</label>

  {thumbnailFile && (
    <p className="text-sm text-green-600 mt-2">
      {thumbnailFile.name}
    </p>
  )}
</div>

            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
  <CardContent>

    <div className="mb-4">
      <Input
        placeholder="اكتب اسم القسم..."
        value={newSectionTitle}
        onChange={(e) => setNewSectionTitle(e.target.value)}
      />
    </div>

    <div className="flex justify-between items-center mb-5">
      <h2 className="font-black text-lg">
        محتوى الكورس
      </h2>

      <Button onClick={addSection}>
        <Plus size={16} />
        إضافة قسم
      </Button>
    </div>

    <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="border rounded-2xl p-4 bg-slate-50"
                  >
                    <div className="flex justify-between items-center mb-3">
  <div className="flex justify-between items-center w-full">
  <h3 className="font-bold">
    {section.title}
  </h3>

  <button
    onClick={() => deleteSection(section.id)}
    className="text-red-600 font-bold hover:text-red-700"
  >
    حذف القسم
  </button>
</div>
</div>

<div className="grid gap-3 mb-4">
  <Input
    placeholder="اسم الدرس"
    value={newLessonTitle}
    onChange={(e) => setNewLessonTitle(e.target.value)}
  />

  <Input
    placeholder="رابط الفيديو"
    value={newVideoUrl}
    onChange={(e) => setNewVideoUrl(e.target.value)}
  />

  <Input
    placeholder="رابط PDF"
    value={newPdfUrl}
    onChange={(e) => setNewPdfUrl(e.target.value)}
  />

  <Button
    size="sm"
    onClick={() => addLesson(section.id)}
  >
                        <Plus size={14} />
                        إضافة درس
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {section.lessons.map((lesson, index) => (
  <div
    key={index}
    className="bg-white dark:bg-[#130726] rounded-xl border p-4"
  >
    <div className="flex justify-between items-center mb-2">
  <div className="flex items-center gap-2">
    <BookOpen size={16} />
    <span className="font-bold">
      {lesson.title}
    </span>
  </div>

  <button
    onClick={() => deleteLesson(section.id, index)}
    className="text-red-600 font-bold hover:text-red-700"
  >
    حذف
  </button>
</div>

    {lesson.videoUrl && (
  <a
    href={lesson.videoUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-blue-600 font-semibold"
  >
    🎥 مشاهدة الفيديو
  </a>
)}

    {lesson.pdfUrl && (
  <a
    href={lesson.pdfUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-emerald-600 font-semibold block mt-1"
  >
    📄 فتح الملف
  </a>
)}
  </div>
))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="flex gap-3">
              <Button variant="secondary">
                <Save size={16} />
                حفظ كمسودة
              </Button>

              <Button onClick={publishCourse}>
  نشر الكورس
</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
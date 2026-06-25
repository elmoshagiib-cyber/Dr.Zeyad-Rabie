import { useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Save,
  Upload,
  BookOpen,
  FileVideo,
  FileText
} from "lucide-react";
export function CreateCourse() {
  const navigate = useNavigate();
const [sections, setSections] = useState<any[]>([]);
const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
const [newPdfFile, setNewPdfFile] = useState<File | null>(null);
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
  console.log("VALUE =", newSectionTitle);
  console.log("SECTIONS =", sections);

  if (!newSectionTitle.trim()) {
    console.log("EMPTY");
    return;
  }

  console.log("ADDING SECTION");

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
                videoFile: newVideoFile,
                pdfFile: newPdfFile,
              },
            ],
          }
        : section
    )
  );

  setNewLessonTitle("");
  setNewVideoFile(null);
  setNewPdfFile(null);
};
        
const deleteLesson = (sectionId: number, lessonIndex: number) => {
  setSections(
    sections.map((section) =>
      section.id === sectionId
        ? {
            ...section,
            lessons: section.lessons.filter(
  (_: any, index: number) => index !== lessonIndex
)
            
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
          <Card className="
overflow-hidden
border-0
shadow-[0_20px_50px_rgba(124,58,237,0.12)]
rounded-3xl
bg-white
dark:bg-[#130726]
">
            <CardContent className="space-y-4">
              <h2 className="
text-2xl
font-black
text-slate-900
dark:text-white
flex
items-center
gap-2
">
📚 بيانات الكورس
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

  <option value="first_prep">
  الصف الأول الإعدادي
</option>

<option value="second_prep">
  الصف الثاني الإعدادي
</option>

<option value="third_prep">
  الصف الثالث الإعدادي
</option>

</Select>

</div>

              <div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    صورة الكورس
  </label>

  <input
  id="thumbnail-upload"
  type="file"
  accept="image/*"
  className="hidden"
  onChange={(e) => {
    if (e.target.files?.[0]) {
      setThumbnailFile(e.target.files[0]);
    }
  }}
/>
<div className="mt-2">

  <label
    htmlFor="thumbnail-upload"
    className="
    flex
    flex-col
    items-center
    justify-center
    h-48
    border-2
    border-dashed
    border-violet-300
    rounded-3xl
    cursor-pointer
    hover:border-violet-500
    hover:bg-violet-50
    transition-all
    "
  >

    <Upload size={40} className="text-violet-600 mb-3" />

    <span className="font-bold text-violet-700">
      اضغط لرفع صورة الكورس
    </span>

    <span className="text-sm text-slate-500 mt-1">
      PNG - JPG - WEBP
    </span>

  </label>

</div>

  {thumbnailFile && (
  <div className="mt-4">

    <img
      src={URL.createObjectURL(thumbnailFile)}
      alt=""
      className="
      h-52
      w-full
      object-cover
      rounded-2xl
      border
      "
    />

    <p className="text-green-600 text-sm mt-2 font-bold">
      ✓ {thumbnailFile.name}
    </p>

  </div>
)}
</div>

            </CardContent>
          </Card>

          {/* Sections */}
          <Card className="
border-0
rounded-3xl
shadow-[0_20px_50px_rgba(124,58,237,0.12)]
bg-white
dark:bg-[#130726]
">
  <CardContent>

    <div className="mb-4">
      <input
  type="text"
  className="border p-3 w-full"
  placeholder="اكتب اسم القسم..."
  value={newSectionTitle}
  onChange={(e) => {
    console.log(e.target.value);
    setNewSectionTitle(e.target.value);
  }}
/>
<p>{newSectionTitle}</p>
<p className="text-red-500">
  {newSectionTitle}
</p>
    </div>

    <div className="
flex
items-center
justify-between
mb-6
pb-4
border-b
">
      <h2 className="font-black text-lg">
        محتوى الكورس
      </h2>

      <Button
onClick={addSection}
className="
bg-gradient-to-r
from-violet-600
to-fuchsia-600
hover:opacity-90
"
>
  <Plus size={16}/>
  إضافة قسم
</Button>
    </div>

    <div className="space-y-4">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className="
bg-gradient-to-r
from-slate-50
to-white
dark:from-[#18092f]
dark:to-[#130726]
border
border-violet-100
dark:border-violet-500/20
rounded-3xl
p-6
shadow-sm
"
                  >
                    <div className="flex justify-between items-center mb-3">
  <div className="flex justify-between items-center w-full">
  <h3 className="
font-black
text-lg
text-slate-900
dark:text-white
">
  {section.title}
</h3>

  <button
onClick={() => deleteSection(section.id)}
className="
px-4
py-2
rounded-xl
bg-red-50
text-red-600
font-bold
hover:bg-red-100
"
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

  <input
  type="file"
  accept="video/*"
  onChange={(e) =>
    setNewVideoFile(e.target.files?.[0] || null)
  }
/>

<input
  type="file"
  accept=".pdf"
  onChange={(e) =>
    setNewPdfFile(e.target.files?.[0] || null)
  }
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
                      {section.lessons.map((lesson: any, index: number) => (
  <div
    key={index}
    className="
bg-white
dark:bg-[#1a0930]
rounded-2xl
border
border-slate-100
dark:border-violet-500/20
p-5
shadow-sm
hover:shadow-md
transition-all
"
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

    <div className="flex flex-col gap-2 mt-3">

  {lesson.videoFile && (
    <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
      <FileVideo size={16} />
      <span>{lesson.videoFile.name}</span>
    </div>
  )}

  {lesson.pdfFile && (
    <div className="flex items-center gap-2 text-emerald-600 text-sm font-medium">
      <FileText size={16} />
      <span>{lesson.pdfFile.name}</span>
    </div>
  )}

</div>
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
        <div className="sticky bottom-0 bg-white dark:bg-[#130726] p-6 border-t">

  <Button
    onClick={publishCourse}
    className="
    w-full
    h-14
    text-lg
    font-black
    rounded-2xl
    bg-gradient-to-r
    from-violet-600
    via-fuchsia-600
    to-pink-600
    shadow-lg
    "
  >
    🚀 نشر الكورس الآن
  </Button>

</div>
      </main>
    </div>
  );
}
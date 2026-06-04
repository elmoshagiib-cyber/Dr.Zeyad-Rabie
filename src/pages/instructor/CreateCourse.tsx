import { useState } from "react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { Plus, BookOpen, Save, Upload } from "lucide-react";

export function CreateCourse() {
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
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
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
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  وصف الكورس
                </label>

                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="اكتب وصف الكورس..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="السعر"
                  placeholder="450"
                />

                <Select label="الصف الدراسي">
                  <option>الصف الأول الثانوي</option>
                  <option>الصف الثاني الثانوي</option>
                  <option>الصف الثالث الثانوي</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  صورة الكورس
                </label>

                <Button variant="outline">
                  <Upload size={16} />
                  رفع صورة
                </Button>
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
    className="bg-white rounded-xl border p-4"
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
                ٍ
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

              <Button>
                نشر الكورس
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
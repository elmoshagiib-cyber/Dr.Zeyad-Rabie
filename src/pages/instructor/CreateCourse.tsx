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
      lessons: ["الدرس الأول"],
    },
  ]);

  const addSection = () => {
    setSections([
      ...sections,
      {
        id: Date.now(),
        title: `قسم جديد ${sections.length + 1}`,
        lessons: [],
      },
    ]);
  };

  const addLesson = (sectionId: number) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              lessons: [
                ...section.lessons,
                `درس جديد ${section.lessons.length + 1}`,
              ],
            }
          : section
      )
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
                      <h3 className="font-bold">
                        {section.title}
                      </h3>

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
                          className="bg-white rounded-xl border p-3 flex items-center gap-2"
                        >
                          <BookOpen size={16} />
                          <span>{lesson}</span>
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
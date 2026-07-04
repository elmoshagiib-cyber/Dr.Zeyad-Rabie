import {
  ChevronDown,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  ClipboardList,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { LessonCard } from "./LessonCard";
import { useState } from "react";
import { LessonEditor } from "./LessonEditor";

type Props = {
  section: any;

  addLesson: (
    sectionId: string,
    lesson: any
  ) => void;

  deleteSection: (sectionId: string) => void;

  deleteLesson: (
    sectionId: string,
    lessonIndex: number
  ) => void;
};

export function SectionCard({
    
  section,
  addLesson,
  deleteSection,
  deleteLesson,
}: Props) {
    const [showEditor, setShowEditor] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const videos = section.lessons.filter(
  (l: any) => l.videoFile
).length;

const pdfs = section.lessons.filter(
  (l: any) => l.pdfFile
).length;

const homeworks = section.lessons.filter(
  (l: any) => l.homework
).length;

const exams = section.lessons.filter(
  (l: any) => l.exam
).length;


const videosCount = section.lessons.reduce(
  (acc: number, lesson: any) =>
    acc + (lesson.videos?.length || 0),
  0
);

const pdfsCount = section.lessons.reduce(
  (acc: number, lesson: any) =>
    acc + (lesson.pdfs?.length || 0),
  0
);

const homeworkCount = section.lessons.reduce(
  (acc: number, lesson: any) =>
    acc + (lesson.homeworks?.length || 0),
  0
);

const examsCount = section.lessons.reduce(
  (acc: number, lesson: any) =>
    acc + (lesson.exams?.length || 0),
  0
);

  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200">

      <CardContent className="p-6">

        {/* Header */}

       <div className="flex items-center justify-between">

  <div
    className="flex flex-1 cursor-pointer items-center gap-4"
    onClick={() => setIsOpen(!isOpen)}
  >

    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100">

      <BookOpen className="text-violet-700"/>

    </div>

    <div>

      <h3 className="text-xl font-black">
        {section.title}
      </h3>

      <p className="text-slate-500">

        {section.lessons.length} درس

      </p>

    </div>

  </div>

  <ChevronDown
    className={`transition ${
      isOpen ? "rotate-180" : ""
    }`}
  />
<div className="flex items-center gap-2">

  <Button
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      setShowEditor(!showEditor);
    }}
  >
    <Plus size={16} />

    {showEditor ? "إلغاء" : "إضافة درس"}

  </Button>

  <Button
    variant="danger"
    size="sm"
    onClick={(e) => {
      e.stopPropagation();
      deleteSection(section.id);
    }}
  >
    <Trash2 size={16} />
  </Button>

  <Button
    variant="ghost"
    size="icon"
    onClick={() => setIsOpen(!isOpen)}
  >
    <ChevronDown
      size={18}
      className={`transition-transform duration-300 ${
        isOpen ? "rotate-180" : ""
      }`}
    />
  </Button>

</div>
</div>

        {/* Lessons */}
{isOpen && (
  <>
{showEditor && (

  <div className="mb-8">

<LessonEditor
  onSave={(lesson) => {

    addLesson(section.id, lesson);

    setShowEditor(false);

  }}
/>

  </div>

)}

        <div className="space-y-4 mt-8">

          {section.lessons.length === 0 ? (
            <div
              className="
              rounded-2xl
              border-2
              border-dashed
              border-slate-200
              p-8
              text-center
              text-slate-400
              "
            >
              <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">

  <BookOpen
    size={40}
    className="mx-auto text-slate-300"
  />

  <p className="mt-4 font-semibold text-slate-600">
    لا توجد دروس داخل هذا الباب
  </p>

  <p className="mt-1 text-sm text-slate-400">
    اضغط على "إضافة درس" للبدء.
  </p>

</div>
            </div>
          ) : (
            section.lessons.map(
              (lesson: any, index: number) => (
                <LessonCard
                  key={index}
                  lesson={lesson}
                  sectionId={section.id}
                  lessonIndex={index}
                  deleteLesson={deleteLesson}
                />
              )
            )
          )}

        </div>
        <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">

<div className="flex items-center gap-2 rounded-full bg-violet-50 px-4 py-2 text-violet-700">

<BookOpen size={15} />

{videosCount} فيديو

</div>

<div className="flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-blue-700">

<FileText size={15}/>

{pdfsCount} PDF

</div>

  <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-orange-700">

<ClipboardList size={15}/>

{homeworkCount} واجب

</div>

 <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-2 text-green-700">

<FileCheck size={15}/>

{examsCount} امتحان

</div>

</div>
  </>
)}


      </CardContent>

    </Card>
  );
}
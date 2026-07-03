import { ChevronDown, Plus, Trash2, BookOpen } from "lucide-react";
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
  return (
    <Card className="rounded-3xl shadow-sm border border-slate-200">

      <CardContent className="p-6">

        {/* Header */}

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-3">

            <BookOpen className="text-violet-600" />

            <div>

              <h3 className="font-bold text-lg">
                {section.title}
              </h3>

              <p className="text-slate-500 text-sm">
                {section.lessons.length} درس
              </p>

            </div>

          </div>

          <div className="flex gap-2">

           <Button
  size="sm"
  onClick={() => setShowEditor(!showEditor)}
>
  <Plus size={16} />

  {showEditor ? "إلغاء" : "إضافة درس"}

</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() =>
                deleteSection(section.id)
              }
            >
              <Trash2 size={16} />
            </Button>

          </div>

        </div>

        {/* Lessons */}

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
              لا يوجد دروس داخل هذا الباب
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

      </CardContent>

    </Card>
  );
}
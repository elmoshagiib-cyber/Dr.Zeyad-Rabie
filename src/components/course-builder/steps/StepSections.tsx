import { Plus } from "lucide-react";
import { Button } from "../../ui/Button";
import { SectionCard } from "../section/SectionCard";

type Props = {
  sections: any[];

  addSection: () => void;

  deleteSection: (sectionId: string) => void;

  addLesson: (
    sectionId: string,
    lesson: any
  ) => void;

  deleteLesson: (
    sectionId: string,
    lessonIndex: number
  ) => void;
};

export function StepSections({
  sections,
  addSection,
  deleteSection,
  addLesson,
  deleteLesson,
}: Props) {
  return (
    <div className="space-y-6">

      {sections.map((section) => (
        <SectionCard
          key={section.id}
          section={section}
          addLesson={addLesson}
          deleteSection={deleteSection}
          deleteLesson={deleteLesson}
        />
      ))}

      <Button
        onClick={addSection}
        className="rounded-2xl"
      >
        <Plus size={18} />

        إضافة باب جديد
      </Button>

    </div>
  );
}
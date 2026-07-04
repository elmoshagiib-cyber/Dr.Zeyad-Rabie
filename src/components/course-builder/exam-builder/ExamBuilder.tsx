import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Card, CardContent } from "../../ui/Card";
import { Plus, Save } from "lucide-react";
import { useState, ChangeEvent } from "react";
import { QuestionCard } from "./QuestionCard";
import { ExamPreview } from "./ExamPreview";
import { Settings2 } from "lucide-react";

export type Question = {
  id: string;
  type: "mcq" | "truefalse" | "essay";
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
};

type Props = {
  onSave: (exam: any) => void;
  onClose: () => void;
};

export function ExamBuilder({
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState("");

  const [questions, setQuestions] = useState<Question[]>([
    {
  id: crypto.randomUUID(),
  type: "mcq",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  points: 1,
}
  ]);

  const [duration, setDuration] = useState(60);

const [passScore, setPassScore] = useState(50);

const [shuffleQuestions, setShuffleQuestions] =
  useState(false);

const [showResult, setShowResult] =
  useState(true);

const [allowBack, setAllowBack] =
  useState(true);

  const totalPoints = questions.reduce(
  (acc, q) => acc + q.points,
  0
);

 return (
  <Card className="rounded-3xl border border-slate-200 shadow-xl">

    <CardContent className="space-y-8 p-8">

      {/* Header */}
     <div>

  <h2 className="text-3xl font-black">
    إنشاء امتحان
  </h2>

  <p className="mt-2 text-slate-500">
    أنشئ الامتحان بالكامل ثم أضف الأسئلة وحدد الإجابات الصحيحة.
  </p>

</div>

      {/* Exam Title */}
      <div className="space-y-2">

        <label className="font-semibold">
          اسم الامتحان
        </label>

            <Input
          value={title}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
          placeholder="مثال : امتحان الباب الأول"
        />
        
<Card className="rounded-3xl border border-slate-200">

  <CardContent className="p-6">

   <div className="flex items-center gap-3 mb-6">

<Settings2 className="text-violet-600"/>

<h3 className="text-xl font-black">

إعدادات الامتحان

</h3>

</div>

    <div className="grid md:grid-cols-2 gap-6">

      <div className="space-y-2">

        <label>مدة الامتحان (دقيقة)</label>

        <Input
          type="number"
          value={duration}
          onChange={(e) =>
            setDuration(Number(e.target.value))
          }
        />

      </div>

      <div className="space-y-2">

        <label>درجة النجاح (%)</label>

        <Input
          type="number"
          value={passScore}
          onChange={(e) =>
            setPassScore(Number(e.target.value))
          }
        />

      </div>

    </div>

    <div className="mt-8 space-y-4">

      <label className="flex items-center justify-between">

        <span>
          ترتيب الأسئلة عشوائياً
        </span>

        <input
          type="checkbox"
          checked={shuffleQuestions}
          onChange={(e) =>
            setShuffleQuestions(
              e.target.checked
            )
          }
        />

      </label>

      <label className="flex items-center justify-between">

        <span>
          إظهار النتيجة بعد التسليم
        </span>

        <input
          type="checkbox"
          checked={showResult}
          onChange={(e) =>
            setShowResult(
              e.target.checked
            )
          }
        />

      </label>

      <label className="flex items-center justify-between">

        <span>
          السماح بالرجوع للأسئلة
        </span>

        <input
          type="checkbox"
          checked={allowBack}
          onChange={(e) =>
            setAllowBack(
              e.target.checked
            )
          }
        />

      </label>

    </div>

  </CardContent>

</Card>
    

      </div>

      {/* Questions */}
<div className="grid xl:grid-cols-2 gap-8">

      <div className="space-y-5">


<div className="grid grid-cols-3 gap-4 mb-8">

  <div className="rounded-2xl bg-violet-50 p-4 text-center">

    <p className="text-2xl font-black">
      {questions.length}
    </p>

    <span className="text-sm text-slate-500">
      سؤال
    </span>

  </div>

  <div className="rounded-2xl bg-blue-50 p-4 text-center">

    <p className="text-2xl font-black">
      {totalPoints}
    </p>

    <span className="text-sm text-slate-500">
      درجة
    </span>

  </div>

  <div className="rounded-2xl bg-green-50 p-4 text-center">

    <p className="text-2xl font-black">
      {
        questions.filter(
          (q) => q.question
        ).length
      }
    </p>

    <span className="text-sm text-slate-500">
      مكتمل
    </span>

  </div>

</div>

        {questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            index={index}
            question={question}
            onChange={(updated) => {

              setQuestions((prev) =>
                prev.map((q) =>
                  q.id === updated.id
                    ? updated
                    : q
                )
              );

            }}
            onDelete={() =>

              setQuestions((prev) =>
                prev.filter(
                  (q) => q.id !== question.id
                )
              )

            }
          />

        ))}

      </div>
<div className="sticky top-24">

  <ExamPreview
    title={title}
    questions={questions}
  />

</div>

  </div>
      {/* Footer */}

      <div className="flex items-center justify-between">

        <Button
          
          onClick={() =>
            setQuestions([
              ...questions,
              {
  id: crypto.randomUUID(),
  type: "mcq",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  points: 1,
}
            ])
          }
        >

          <Plus size={18} />

          إضافة سؤال

        </Button>

        <div className="flex gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>

          <Button
disabled={
  !title ||
  questions.some(
    (q) => !q.question.trim()
  )
}
            onClick={() =>
             onSave({
  title,
  questions,
  duration,
  passScore,
  shuffleQuestions,
  showResult,
  allowBack,
})
            }
          >

            <Save size={18} />

            حفظ الامتحان

          </Button>

        </div>

      </div>

    </CardContent>

  </Card>
);
}
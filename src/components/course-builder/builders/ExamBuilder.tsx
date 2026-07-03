import { useState } from "react";
import { ArrowRight, Clock, Plus, Save } from "lucide-react";

import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

import { MCQQuestion } from "../questions/MCQQuestion";
import { EssayQuestion } from "../questions/EssayQuestion";
import { TrueFalseQuestion } from "../questions/TrueFalseQuestion";

type QuestionType =
  | "mcq"
  | "essay"
  | "truefalse";

export function ExamBuilder() {
  const [examName, setExamName] = useState("");

  const [hasTimer, setHasTimer] = useState(true);

  const [duration, setDuration] = useState("");

const [questions, setQuestions] = useState<any[]>([]);

  function addQuestion(type: QuestionType) {
  if (type === "mcq") {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),

        type: "mcq",

        question: "",

        image: null,

        options: ["", "", "", ""],

        correctAnswer: 0,
      },
    ]);

    return;
  }

  if (type === "essay") {
    setQuestions([
      ...questions,
      {
        id: crypto.randomUUID(),

        type: "essay",

        question: "",

        image: null,

        degree: 5,
      },
    ]);

    return;
  }

  setQuestions([
    ...questions,
    {
      id: crypto.randomUUID(),

      type: "truefalse",

      question: "",

      image: null,

      answer: true,
    },
  ]);
}

  return (
    <Card className="rounded-3xl shadow-sm border">

      <CardContent className="p-8 space-y-8">

        <Button
          variant="outline"
          className="mb-2"
        >
          <ArrowRight size={18} />

          رجوع للدرس
        </Button>

        <div>

          <h2 className="text-3xl font-bold">

            إنشاء امتحان

          </h2>

          <p className="text-slate-500 mt-2">

            قم بإنشاء امتحان جديد وإضافة الأسئلة.

          </p>

        </div>

        <Input
          value={examName}
          onChange={(e) =>
            setExamName(e.target.value)
          }
          placeholder="اسم الامتحان"
        />

        <label className="flex items-center gap-3">

          <input
            type="checkbox"
            checked={hasTimer}
            onChange={() =>
              setHasTimer(!hasTimer)
            }
          />

          يوجد وقت للامتحان

        </label>

        {hasTimer && (
          <Input
            type="number"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            placeholder="مدة الامتحان بالدقائق"
          />
        )}

        <div className="grid md:grid-cols-3 gap-4">

          <Button
            onClick={() =>
              addQuestion("mcq")
            }
          >
            <Plus size={16} />

            سؤال اختيارى

          </Button>

          <Button
            onClick={() =>
              addQuestion("truefalse")
            }
          >
            <Plus size={16} />

            صح وخطأ

          </Button>

          <Button
            onClick={() =>
              addQuestion("essay")
            }
          >
            <Plus size={16} />

            سؤال مقالى

          </Button>

        </div>

        <div className="space-y-6">

          {questions.map((q) => {

            if (q.type === "mcq")
              return (
                <MCQQuestion
    key={q.id}

    question={q}

    onChange={(updated) => {
      setQuestions(
        questions.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );
    }}

    onDelete={() => {
      setQuestions(
        questions.filter(
          (item) => item.id !== q.id
        )
      );
    }}
/>
              );

            if (q.type === "essay")
              return (
                <EssayQuestion
                  key={q.id}
                />
              );

            return (
              <TrueFalseQuestion
                key={q.id}
              />
            );

          })}

        </div>

        <Button>

          <Save size={18} />

          حفظ الامتحان

        </Button>

      </CardContent>

    </Card>
  );
}
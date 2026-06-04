import { useNavigate } from "react-router-dom";
import { Plus, Clock, FileText, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useState } from "react";

export function InstructorExams() {
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [examPassMark, setExamPassMark] = useState("");
const [exams, setExams] = useState<any[]>([  
   {
  id: 1,
  title: "اختبار الكيمياء العضوية",
  questions: [],
  duration: 20,
  passMark: 60,
  status: "published",
},
{
  id: 2,
  title: "اختبار الهيدروكربونات",
  questions: [],
  duration: 30,
  passMark: 70,
  status: "draft",
},
    
 ]);
const createExam = () => {
  if (!examTitle.trim()) return;

  setExams([
    ...exams,
    {
  id: Date.now(),
  title: examTitle,
  questions: [],
  duration: Number(examDuration),
  passMark: Number(examPassMark),
  status: "draft",
}
  ]);

  setExamTitle("");
  setExamDuration("");
  setExamPassMark("");
};
const deleteExam = (examId: number) => {
  setExams(
    exams.filter((exam) => exam.id !== examId)
  );
};
const addQuestion = (examId: number) => {
  if (!questionText.trim()) return;

  setExams(
    exams.map((exam) =>
      exam.id === examId
        ? {
            ...exam,
            questions: [
              ...exam.questions,
              {
                question: questionText,
                options: {
                  A: optionA,
                  B: optionB,
                  C: optionC,
                  D: optionD,
                },
                correctAnswer,
              },
            ],
          }
        : exam
    )
  );

  setQuestionText("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswer("A");
};

const deleteQuestion = (
  examId: number,
  questionIndex: number
) => {
  setExams(
    exams.map((exam) =>
      exam.id === examId
        ? {
            ...exam,
            questions: exam.questions.filter(
              (_: any, index: number) =>
                index !== questionIndex
            ),
          }
        : exam
    )
  );
};
  
const [questionText, setQuestionText] = useState("");
const [optionA, setOptionA] = useState("");
const [optionB, setOptionB] = useState("");
const [optionC, setOptionC] = useState("");
const [optionD, setOptionD] = useState("");
const [correctAnswer, setCorrectAnswer] = useState("A");

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              الاختبارات
            </h1>
            <p className="text-slate-500 text-sm">
              إدارة جميع الاختبارات الخاصة بك
            </p>
          </div>

 <Button>
  <Plus size={16} />
  اختبار جديد
</Button>
        </div>
<Card>
  <CardContent className="space-y-4">

    <h2 className="font-black text-lg">
      إنشاء اختبار جديد
    </h2>

    <Input
      placeholder="اسم الاختبار"
      value={examTitle}
      onChange={(e) => setExamTitle(e.target.value)}
    />

    <Input
      placeholder="مدة الاختبار بالدقائق"
      value={examDuration}
      onChange={(e) => setExamDuration(e.target.value)}
    />

    <Input
      placeholder="درجة النجاح %"
      value={examPassMark}
      onChange={(e) => setExamPassMark(e.target.value)}
    />

   <Button onClick={createExam}>
  <Plus size={16} />
  إنشاء الاختبار
</Button>

  </CardContent>
</Card>
        <div className="p-6 space-y-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent>
                <div className="flex justify-between items-start">

                  <div>
                    <h2 className="font-black text-lg mb-2">
                      {exam.title}
                    </h2>

                    <div className="flex flex-wrap gap-4 text-sm text-slate-500">

                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {exam.questions.length} سؤال
                      </span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {exam.duration} دقيقة
                      </span>

                      <span>
                        النجاح: {exam.passMark}%
                      </span>

                    </div>
                  </div>

                  <Badge
                    variant={
                      exam.status === "published"
                        ? "emerald"
                        : "blue"
                    }
                  >
                    {exam.status === "published"
                      ? "منشور"
                      : "مسودة"}
                  </Badge>
                </div>
<div className="mt-6 space-y-3 border-t pt-4">

  <Input
    placeholder="اكتب السؤال"
    value={questionText}
    onChange={(e) => setQuestionText(e.target.value)}
  />

  <Input
    placeholder="الإجابة A"
    value={optionA}
    onChange={(e) => setOptionA(e.target.value)}
  />

  <Input
    placeholder="الإجابة B"
    value={optionB}
    onChange={(e) => setOptionB(e.target.value)}
  />

  <Input
    placeholder="الإجابة C"
    value={optionC}
    onChange={(e) => setOptionC(e.target.value)}
  />

  <Input
    placeholder="الإجابة D"
    value={optionD}
    onChange={(e) => setOptionD(e.target.value)}
  />

  <select
    value={correctAnswer}
    onChange={(e) => setCorrectAnswer(e.target.value)}
    className="w-full rounded-xl border border-slate-200 px-4 py-3"
  >
    <option value="A">A</option>
    <option value="B">B</option>
    <option value="C">C</option>
    <option value="D">D</option>
  </select>

  <Button
    size="sm"
    onClick={() => addQuestion(exam.id)}
  >
    <Plus size={14} />
    إضافة سؤال
  </Button>

</div>

{exam.questions.length > 0 && (
  <div className="mt-5 space-y-3">

{exam.questions.map((question: any, index: number) => (      <div
        key={index}
        className="border rounded-xl p-4 bg-slate-50"
      >
        <p className="font-bold mb-3">
          س{index + 1}: {question.question}
        </p>

        <div className="space-y-1 text-sm">

          <p>A) {question.options.A}</p>

          <p>B) {question.options.B}</p>

          <p>C) {question.options.C}</p>

          <p>D) {question.options.D}</p>

        </div>

        <p className="mt-3 text-emerald-600 font-semibold">
          الإجابة الصحيحة: {question.correctAnswer}
        </p>
        <Button
  size="sm"
  variant="danger"
  className="mt-3"
  onClick={() =>
    deleteQuestion(exam.id, index)
  }
>
  <Trash2 size={14} />
  حذف السؤال
</Button>
      </div>
    ))}

  </div>
  
)}
                <div className="flex gap-2 mt-5">

                  <Button size="sm" variant="outline">
                    <Edit size={14} />
                    تعديل
                  </Button>

                  <Button size="sm" variant="danger">
                    <Trash2 size={14} />
                    حذف
                  </Button>

                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
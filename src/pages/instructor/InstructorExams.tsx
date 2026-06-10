import { useNavigate } from "react-router-dom";
import { Plus, Clock, FileText, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Input } from "../../components/ui/Input";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function InstructorExams() {
  const navigate = useNavigate();

  const [examTitle, setExamTitle] = useState("");
  const [examDuration, setExamDuration] = useState("");
  const [examPassMark, setExamPassMark] = useState("");
const [exams, setExams] = useState<any[]>([]);
useEffect(() => {
  loadExams();
}, []);

const loadExams = async () => {
  const { data, error } = await supabase
    .from("exams")
    .select(`
      *,
      exam_questions (*)
    `)
    .order("id", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  setExams(data || []);
};

const createExam = async () => {
  if (!examTitle.trim()) return;

  const { error } = await supabase
    .from("exams")
    .insert({
      title: examTitle,
      duration: Number(examDuration),
      passing_grade: Number(examPassMark),
    });

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  setExamTitle("");
  setExamDuration("");
  setExamPassMark("");
setQuestionText("");
setOptionA("");
setOptionB("");
setOptionC("");
setOptionD("");
setCorrectAnswer("A");

await loadExams();

alert("تم إضافة السؤال");
  await loadExams();
};

const addQuestion = async (examId: number) => {
  if (!questionText.trim()) return;

  const { error } = await supabase
    .from("exam_questions")
    .insert({
      exam_id: examId,
      question: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
    });

  if (error) {
  console.error("QUESTION ERROR:", error);
  alert(JSON.stringify(error));
  return;
}

console.log("QUESTION ADDED");

setQuestionText("");
setOptionA("");
setOptionB("");
setOptionC("");
setOptionD("");
setCorrectAnswer("A");

await loadExams();

alert("تم إضافة السؤال");
};
const deleteQuestion = async (questionId: number) => {
  const { error } = await supabase
    .from("exam_questions")
    .delete()
    .eq("id", questionId);

  if (error) {
    alert(error.message);
    return;
  }

  await loadExams();
  
};
  const deleteExam = async (examId: number) => {
  console.log("DELETE EXAM:", examId);

  const { data, error } = await supabase
  .from("exams")
  .delete()
  .eq("id", examId)
  .select();

console.log(data);
console.log(error);

  if (error) {
    console.error(error);
    alert(error.message);
    return;
  }

  await loadExams();
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
{exam.exam_questions?.length || 0} سؤال
</span>

                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {exam.duration} دقيقة
                      </span>

                      <span>
                      النجاح: {exam?.passing_grade ?? 0}%
                      </span>

                    </div>
                  </div>

                  <Badge variant="blue">
  منشور
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

{(exam.exam_questions?.length || 0) > 0 && (
  <div className="mt-5 space-y-3">

{exam.exam_questions?.map((question: any, index: number) => (
     <div
        key={index}
        className="border rounded-xl p-4 bg-slate-50"
      >
        <p className="font-bold mb-3">
          س{index + 1}: {question.question}
        </p>

        <div className="space-y-1 text-sm">

          <p>A) {question.option_a}</p>

          <p>B) {question.option_b}</p>

          <p>C) {question.option_c}</p>

          <p>D) {question.option_d}</p>

        </div>

        <p className="mt-3 text-emerald-600 font-semibold">
          الإجابة الصحيحة: {question.correct_answer}
        </p>
        <Button
  size="sm"
  variant="danger"
  className="mt-3"
  onClick={() => deleteQuestion(question.id)}
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
<Button
  size="sm"
  variant="danger"
  onClick={() => deleteExam(exam.id)}
>
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
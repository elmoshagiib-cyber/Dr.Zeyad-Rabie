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
  const [editingExamId, setEditingExamId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editPassMark, setEditPassMark] = useState("");
  const navigate = useNavigate();
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);

const [editQuestionText, setEditQuestionText] = useState("");
const [editOptionA, setEditOptionA] = useState("");
const [editOptionB, setEditOptionB] = useState("");
const [editOptionC, setEditOptionC] = useState("");
const [editOptionD, setEditOptionD] = useState("");
const [editCorrectAnswer, setEditCorrectAnswer] = useState("A");

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
const updateExam = async (examId: number) => {
  console.log("UPDATE START");

const { error } = await supabase
  .from("exams")
  .update({
    title: editTitle,
    duration: Number(editDuration),
    passing_grade: Number(editPassMark),
  })
  .eq("id", examId);

console.log("UPDATE ERROR:", error);

if (error) {
  alert(error.message);
  return;
}

alert("UPDATE SUCCESS");


  setEditingExamId(null);

  await loadExams();

  alert("تم تعديل الامتحان");
};
const updateQuestion = async (questionId: number) => {
  const { error } = await supabase
    .from("exam_questions")
    .update({
      question: editQuestionText,
      option_a: editOptionA,
      option_b: editOptionB,
      option_c: editOptionC,
      option_d: editOptionD,
      correct_answer: editCorrectAnswer,
    })
    .eq("id", questionId);

  if (error) {
    alert(error.message);
    return;
  }

  setEditingQuestionId(null);

  await loadExams();

  alert("تم تعديل السؤال");
};
  return (
    
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white dark:bg-[#130726] border-b border-slate-200 px-6 py-5 flex items-center justify-between">
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
<p className="text-red-500">
  editingExamId = {editingExamId} | exam.id = {exam.id}
</p>
{editingExamId === exam.id && (

  <div className="space-y-3 mt-4">

    <Input
      value={editTitle}
      onChange={(e) => setEditTitle(e.target.value)}
      placeholder="اسم الامتحان"
    />

    <Input
      value={editDuration}
      onChange={(e) => setEditDuration(e.target.value)}
      placeholder="مدة الامتحان"
    />

    <Input
      value={editPassMark}
      onChange={(e) => setEditPassMark(e.target.value)}
      placeholder="درجة النجاح"
    />

    <Button onClick={() => updateExam(exam.id)}>
      حفظ التعديلات
    </Button>

  </div>
)}
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
<Button
  size="sm"
  variant="outline"
  className="mt-3 mr-2"
  onClick={() => {
    setEditingQuestionId(question.id);

    setEditQuestionText(question.question);
    setEditOptionA(question.option_a);
    setEditOptionB(question.option_b);
    setEditOptionC(question.option_c);
    setEditOptionD(question.option_d);
    setEditCorrectAnswer(question.correct_answer);
  }}
>
  <Edit size={14} />
  تعديل السؤال
</Button>
{editingQuestionId === question.id && (
  <div className="space-y-3 mt-4">

    <Input
      value={editQuestionText}
      onChange={(e) => setEditQuestionText(e.target.value)}
      placeholder="السؤال"
    />

    <Input
      value={editOptionA}
      onChange={(e) => setEditOptionA(e.target.value)}
      placeholder="الإجابة A"
    />

    <Input
      value={editOptionB}
      onChange={(e) => setEditOptionB(e.target.value)}
      placeholder="الإجابة B"
    />

    <Input
      value={editOptionC}
      onChange={(e) => setEditOptionC(e.target.value)}
      placeholder="الإجابة C"
    />

    <Input
      value={editOptionD}
      onChange={(e) => setEditOptionD(e.target.value)}
      placeholder="الإجابة D"
    />

    <select
      value={editCorrectAnswer}
      onChange={(e) =>
        setEditCorrectAnswer(e.target.value)
      }
      className="w-full rounded-xl border border-slate-200 px-4 py-3"
    >
      <option value="A">A</option>
      <option value="B">B</option>
      <option value="C">C</option>
      <option value="D">D</option>
    </select>

    <Button
      onClick={() => updateQuestion(question.id)}
    >
      حفظ تعديل السؤال
    </Button>

  </div>
)}
      </div>
    ))}

  </div>
  
)}
                <div className="flex gap-2 mt-5">

                  <Button
  size="sm"
  variant="outline"
  onClick={() => {
    console.log("EDIT CLICKED", exam.id);

    setEditingExamId(exam.id);
    setEditTitle(exam.title);
    setEditDuration(String(exam.duration));
    setEditPassMark(String(exam.passing_grade));
  }}
>
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
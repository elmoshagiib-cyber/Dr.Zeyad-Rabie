import { ChangeEvent } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Input } from "../../ui/Input";
import { Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "../../ui/Button";
import { ImagePlus } from "lucide-react";

export type QuestionType =
  | "mcq"
  | "truefalse"
  | "essay";

export type Question = {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;

   image?: File | null;
};

type Props = {
  index: number;
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
};

export function QuestionCard({
  index,
  question,
  onChange,
  onDelete,
}: Props) {
  return (
    <Card className="rounded-3xl border border-slate-200">

      <CardContent className="p-6 space-y-5">

        <div className="flex items-center justify-between">

  <h3 className="text-xl font-black">
    السؤال {index + 1}
  </h3>

  <Button
    variant="danger"
    size="sm"
    onClick={onDelete}
  >
    <Trash2 size={16}/>
  </Button>

</div>

       <div className="grid md:grid-cols-2 gap-4">

  <div className="space-y-2">

    <label className="font-semibold">
      نوع السؤال
    </label>

    <select
      value={question.type}
      onChange={(e) =>
        onChange({
          ...question,
          type: e.target.value as QuestionType,
        })
      }
      className="w-full rounded-xl border border-slate-200 p-3"
    >
      <option value="mcq">
        اختيار من متعدد
      </option>

      <option value="truefalse">
        صح / خطأ
      </option>

      <option value="essay">
        سؤال مقالي
      </option>

    </select>

  </div>

  <div className="space-y-2">

    <label className="font-semibold">
      الدرجة
    </label>

    <Input
      type="number"
      value={question.points}
      onChange={(e) =>
        onChange({
          ...question,
          points: Number(e.target.value),
        })
      }
    />

  </div>

<div className="space-y-3">

  <label className="font-semibold">
    صورة السؤال (اختياري)
  </label>

  <label
    className="
    flex
    h-40
    cursor-pointer
    flex-col
    items-center
    justify-center
    rounded-2xl
    border-2
    border-dashed
    border-slate-200
    bg-slate-50
    transition
    hover:border-violet-500
    hover:bg-violet-50
    "
  >

    <ImagePlus
      size={34}
      className="mb-3 text-violet-600"
    />

    <span>

      {question.image
        ? question.image.name
        : "اختر صورة"}

    </span>

    <input
      hidden
      type="file"
      accept="image/*"
      onChange={(e) =>

        onChange({

          ...question,

          image:
            e.target.files?.[0] || null,

        })

      }
    />

  </label>

</div>
</div>
        <div className="grid gap-3">

{question.type === "mcq" && (
          <div className="space-y-3">

  {question.options.map((option, i) => (

    <div
      key={i}
      className="flex items-center gap-3"
    >

      <input
        type="radio"
        checked={question.correctAnswer === i}
        onChange={() =>
          onChange({
            ...question,
            correctAnswer: i,
          })
        }
      />

      <Input
        value={option}
        placeholder={`الاختيار ${i + 1}`}
        onChange={(e) => {

          const options = [...question.options];

          options[i] = e.target.value;

          onChange({
            ...question,
            options,
          });

        }}
      />

      {question.correctAnswer === i && (
        <CheckCircle2
          className="text-green-600"
          size={20}
        />
      )}

    </div>

  ))}

</div>
)}

{question.type === "truefalse" && (

<div className="space-y-4">

<label className="flex items-center gap-3">

<input
type="radio"
checked={question.correctAnswer===1}
onChange={()=>
onChange({
...question,
correctAnswer:1,
})
}
/>

صح

</label>

<label className="flex items-center gap-3">

<input
type="radio"
checked={question.correctAnswer===0}
onChange={()=>
onChange({
...question,
correctAnswer:0,
})
}
/>

خطأ

</label>

</div>

)}

{question.type==="essay" && (

<div className="rounded-2xl bg-slate-50 p-6 text-center">

سيتم تصحيح هذا السؤال يدوياً.

</div>

)}

        </div>

      </CardContent>

    </Card>
  );
}
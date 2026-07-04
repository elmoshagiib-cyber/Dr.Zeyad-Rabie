import { useState } from "react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import { Save } from "lucide-react";

type Props = {
  onSave: (homework: any) => void;
  onClose: () => void;
};

export function HomeworkBuilder({
  onSave,
  onClose,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [deadline, setDeadline] =
    useState("");

  const [score, setScore] = useState(10);
const [attachments, setAttachments] =
  useState<File[]>([]);
  return (
    <Card className="rounded-3xl shadow-xl border">

      <CardContent className="p-8 space-y-6">

      <div className="flex items-center justify-between">

  <div>

    <h2 className="text-3xl font-black">
      إنشاء واجب
    </h2>

    <p className="mt-2 text-slate-500">
      أنشئ واجباً وحدد بياناته قبل إضافته للدرس.
    </p>

  </div>

  <div className="rounded-2xl bg-violet-50 px-6 py-4">

    <p className="text-sm text-slate-500">
      الدرجة
    </p>

    <p className="text-3xl font-black text-violet-700">
      {score}
    </p>

  </div>

</div>

<div className="grid grid-cols-3 gap-4">

  <div className="rounded-2xl bg-violet-50 p-4 text-center">

    <p className="text-2xl font-black">
      {score}
    </p>

    <span className="text-sm text-slate-500">
      الدرجة
    </span>

  </div>

  <div className="rounded-2xl bg-blue-50 p-4 text-center">

    <p className="text-2xl font-black">
      {deadline ? 1 : 0}
    </p>

    <span className="text-sm text-slate-500">
      موعد
    </span>

  </div>

  <div className="rounded-2xl bg-green-50 p-4 text-center">

    <p className="text-2xl font-black">
      {title ? 1 : 0}
    </p>

    <span className="text-sm text-slate-500">
      مكتمل
    </span>

  </div>

</div>

<label>اسم الواجب</label>
        <Input
          placeholder="اسم الواجب"
          value={title}
          onChange={(e)=>
            setTitle(e.target.value)
          }
        />

        <textarea
          rows={5}
          className="w-full rounded-2xl border p-4"
          placeholder="الوصف"
          value={description}
          onChange={(e)=>
            setDescription(e.target.value)
          }
        />

<label
className="
group
flex
h-48
cursor-pointer
flex-col
items-center
justify-center
rounded-3xl
border-2
border-dashed
border-slate-200
bg-slate-50
transition-all
hover:border-violet-500
hover:bg-violet-50
"
>

📎

<p className="mt-4 font-bold">
رفع الملفات المطلوبة
</p>

<p className="text-sm text-slate-400">
PDF • Word • ZIP • Images
</p>

{attachments.length > 0 && (

<p className="mt-3 text-violet-600">

تم اختيار {attachments.length} ملف

</p>

)}

<input

hidden

multiple

type="file"

accept=".pdf,.doc,.docx,.zip,image/*"

onChange={(e)=>

setAttachments(

Array.from(e.target.files || [])

)

}

/>

</label>

        <div className="grid grid-cols-2 gap-5">

          <Input
            type="datetime-local"
            value={deadline}
            onChange={(e)=>
              setDeadline(e.target.value)
            }
          />

          <Input
            type="number"
            value={score}
            onChange={(e)=>
              setScore(Number(e.target.value))
            }
          />

        </div>

        <div className="flex justify-end gap-3">

          <Button
            variant="outline"
            onClick={onClose}
          >
            إلغاء
          </Button>

          <Button
disabled={
  !title.trim() ||
  !description.trim()
}
            onClick={()=>

             onSave({
  title,
  description,
  deadline,
  score,
  attachments,
})

            }
          >
            <Save size={18}/>
            حفظ الواجب
          </Button>

        </div>

      </CardContent>

    </Card>
  );
}
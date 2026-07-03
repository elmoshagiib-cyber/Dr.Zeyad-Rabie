import { Trash2, ImagePlus } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

type Props = {
  question: any;
  onChange: (question: any) => void;
  onDelete: () => void;
};

export function MCQQuestion({
  question,
  onChange,
  onDelete,
}: Props) {
  function updateOption(index: number, value: string) {
    const options = [...question.options];

    options[index] = value;

    onChange({
      ...question,
      options,
    });
  }

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">

      <CardContent className="p-6 space-y-6">

        <div className="flex items-center justify-between">

          <h3 className="font-bold text-lg">
            سؤال اختيارى
          </h3>

          <Button
            size="sm"
            variant="danger"
            onClick={onDelete}
          >
            <Trash2 size={16} />
          </Button>

        </div>

        {/* السؤال */}

        <div className="space-y-2">

          <label className="font-semibold">
            نص السؤال
          </label>

          <Input
            value={question.question}
            onChange={(e) =>
              onChange({
                ...question,
                question: e.target.value,
              })
            }
            placeholder="اكتب السؤال..."
          />

        </div>

        {/* صورة */}

        <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-violet-500 transition">

          <ImagePlus
            className="mx-auto text-violet-600"
            size={34}
          />

          <p className="mt-3 font-medium">
            رفع صورة للسؤال
          </p>

          <input
            hidden
            type="file"
            accept="image/*"
            onChange={(e) =>
              onChange({
                ...question,
                image: e.target.files?.[0] || null,
              })
            }
          />

        </label>

        {/* الاختيارات */}

        <div className="grid md:grid-cols-2 gap-4">

          <Input
            value={question.options[0]}
            onChange={(e) =>
              updateOption(0, e.target.value)
            }
            placeholder="الإجابة A"
          />

          <Input
            value={question.options[1]}
            onChange={(e) =>
              updateOption(1, e.target.value)
            }
            placeholder="الإجابة B"
          />

          <Input
            value={question.options[2]}
            onChange={(e) =>
              updateOption(2, e.target.value)
            }
            placeholder="الإجابة C"
          />

          <Input
            value={question.options[3]}
            onChange={(e) =>
              updateOption(3, e.target.value)
            }
            placeholder="الإجابة D"
          />

        </div>

        {/* الصحيحة */}

        <div className="space-y-2">

          <label className="font-semibold">
            الإجابة الصحيحة
          </label>

          <select
            value={question.correctAnswer}
            onChange={(e) =>
              onChange({
                ...question,
                correctAnswer: Number(e.target.value),
              })
            }
            className="
              w-full
              h-12
              rounded-xl
              border
              border-slate-200
              px-4
            "
          >
            <option value={0}>A</option>
            <option value={1}>B</option>
            <option value={2}>C</option>
            <option value={3}>D</option>
          </select>

        </div>

      </CardContent>

    </Card>
  );
}
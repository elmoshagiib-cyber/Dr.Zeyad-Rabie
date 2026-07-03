import { Trash2, ImagePlus } from "lucide-react";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";

export function EssayQuestion() {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">

      <CardContent className="p-6 space-y-6">

        <div className="flex items-center justify-between">

          <h3 className="font-bold text-lg">
            سؤال مقالي
          </h3>

          <Button
            size="sm"
            variant="danger"
          >
            <Trash2 size={16} />
          </Button>

        </div>

        <div className="space-y-2">

          <label className="font-semibold">
            نص السؤال
          </label>

          <textarea
            rows={4}
            placeholder="اكتب السؤال..."
            className="
            w-full
            rounded-xl
            border
            border-slate-200
            p-4
            resize-none
            outline-none
            focus:ring-2
            focus:ring-violet-500
            "
          />

        </div>

        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center">

          <ImagePlus
            className="mx-auto text-violet-600"
            size={34}
          />

          <p className="mt-3 font-medium">
            رفع صورة للسؤال (اختياري)
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          <div>

            <label className="font-semibold block mb-2">
              درجة السؤال
            </label>

            <Input
              type="number"
              placeholder="5"
            />

          </div>

          <div>

            <label className="font-semibold block mb-2">
              الحد الأقصى لعدد السطور (اختياري)
            </label>

            <Input
              type="number"
              placeholder="10"
            />

          </div>

        </div>

      </CardContent>

    </Card>
  );
}
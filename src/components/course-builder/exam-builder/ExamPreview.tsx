import { Question } from "./QuestionCard";

type Props = {
  title: string;
  questions: Question[];
};

export function ExamPreview({
  title,
  questions,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

      <h2 className="text-2xl font-black">
        {title || "معاينة الامتحان"}
      </h2>

      <div className="mt-6 space-y-8">

        {questions.map((q, index) => (

          <div
            key={q.id}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >

            <h3 className="font-bold mb-4">

              {index + 1}. {q.question || "اكتب السؤال..."}

            </h3>

            {q.type === "mcq" && (

              <div className="space-y-3">

                {q.options.map((option, i) => (

                  <label
                    key={i}
                    className="flex items-center gap-3"
                  >

                    <input
                      type="radio"
                      disabled
                    />

                    {option || `اختيار ${i + 1}`}

                  </label>

                ))}

              </div>

            )}

            {q.type === "truefalse" && (

              <div className="space-y-3">

                <label className="flex gap-3">

                  <input
                    type="radio"
                    disabled
                  />

                  صح

                </label>

                <label className="flex gap-3">

                  <input
                    type="radio"
                    disabled
                  />

                  خطأ

                </label>

              </div>

            )}

            {q.type === "essay" && (

              <textarea
                disabled
                rows={4}
                className="w-full rounded-xl border p-3"
                placeholder="سيكتب الطالب الإجابة هنا..."
              />

            )}

{q.image && (

<img
  src={URL.createObjectURL(q.image)}
  className="
  mt-4
  mb-5
  w-full
  rounded-2xl
  object-cover
  max-h-80
  "
/>

)}
          </div>

        ))}

        

      </div>

    </div>
  );
}
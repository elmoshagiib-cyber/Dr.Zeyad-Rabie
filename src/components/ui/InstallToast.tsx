import { Download, CheckCircle2 } from "lucide-react";

type Props = {
  type: "loading" | "success";
};

export default function InstallToast({ type }: Props) {
  return (
    <div
      className="
      w-[360px]
      rounded-2xl
      border
      border-[#E9D8FF]
      bg-white
      shadow-[0_20px_45px_rgba(179,72,254,.18)]
      overflow-hidden
      "
    >
      <div className="flex items-center gap-4 px-5 py-4">

        <div
          className="
          w-12
          h-12
          rounded-xl
          bg-[#B348FE]/10
          flex
          items-center
          justify-center
          "
        >
          {type === "loading" ? (
            <Download className="w-6 h-6 text-[#B348FE] animate-bounce" />
          ) : (
            <CheckCircle2 className="w-6 h-6 text-[#22C55E]" />
          )}
        </div>

        <div className="flex-1">

          <h3 className="font-extrabold text-[#1F2937]">
            {type === "loading"
              ? "جاري تجهيز التثبيت..."
              : "تم إرسال طلب التثبيت"}
          </h3>

          <p className="text-sm text-gray-500 mt-1 leading-6">
            {type === "loading"
              ? "ستظهر نافذة التثبيت خلال لحظات."
              : "يمكنك متابعة استخدام المنصة أثناء اكتمال التثبيت."}
          </p>

        </div>

      </div>

      {type === "loading" && (
        <div className="h-1 bg-gray-100">
          <div className="h-full w-full bg-[#F6AC08] animate-pulse" />
        </div>
      )}
    </div>
  );
}
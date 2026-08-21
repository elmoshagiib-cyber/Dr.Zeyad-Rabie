import { MessageCircle, Clock } from "lucide-react";

export default function ForumPage() {
  return (
    <div
      dir="rtl"
      className="min-h-full flex items-center justify-center p-6"
    >
      <div className="w-full max-w-2xl text-center">

        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
          <MessageCircle
            size={40}
            className="text-emerald-500"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          المنتدى العلمي
        </h1>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-base leading-7 max-w-lg mx-auto">
          مساحة مخصصة للطلاب لمناقشة الدروس، وطرح الأسئلة،
         ومشاركة المعرفة والخبرات مع باقي الطلاب والمستر.
        </p>

        {/* Coming Soon */}
        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-5 py-3 text-emerald-600 dark:text-emerald-400 font-medium">
          <Clock size={18} />
          <span>المنتدى قريبًا</span>
        </div>

      </div>
    </div>
  );
}
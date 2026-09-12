import { MessageCircle, Clock } from "lucide-react";

export default function ForumPage() {
  return (
    <div
      dir="rtl"
      className="min-h-full flex items-center justify-center p-5 sm:p-6"
    >
      <div className="w-full max-w-2xl text-center">

        {/* Icon */}
        <div className="mx-auto mb-5 sm:mb-6 flex h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#B348FE]/10">
          <MessageCircle
            className="text-[#B348FE] w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
          />
        </div>

        {/* Title */}
        <h1 className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold text-[#5800a9] dark:text-white mb-2.5 sm:mb-3">
          المنتدى العلمي
        </h1>

        {/* Description */}
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-6 sm:leading-7 max-w-lg mx-auto px-2 sm:px-0">
          مساحة مخصصة للطلاب لمناقشة الدروس، وطرح الأسئلة،
          ومشاركة المعرفة والخبرات مع باقي الطلاب والمستر.
        </p>

        {/* Coming Soon */}
        <div className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-[#F6EEFF] dark:bg-[#B348FE]/10 px-4 sm:px-5 py-2.5 sm:py-3 text-[#B348FE] dark:text-[#C97AFF] font-medium text-sm sm:text-base">
          <Clock size={16} className="sm:hidden" />
          <Clock size={18} className="hidden sm:block" />
          <span>المنتدى قريبًا</span>
        </div>

      </div>
    </div>
  );
}
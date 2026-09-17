import { useState } from "react";
import { Trophy } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import toast from "react-hot-toast";
import { usePageTransition } from "../../context/PageTransitionContext";

export function LeaderboardPage() {
  const transitionTo = usePageTransition();

  const showComingSoon = () => {
    toast("الميزة دي هتتاح قريبًا، تابعنا!");
  };

  return (
    <StudentLayout>
      <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="text-right order-2 sm:order-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-700 dark:text-emerald-400 mb-2">
              أبطال المنصة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-7 max-w-xl">
              حل امتحاناتك وواجباتك بجد واجمع نقط تاخدك لمركز في اللوحة — قريبًا!
            </p>
          </div>

          <button
            onClick={() => transitionTo("/leaderboard")}
            className="
              order-1 sm:order-2
              flex-shrink-0
              inline-flex items-center gap-1.5
              px-4 py-2.5 rounded-xl
              text-sm font-bold
              bg-emerald-50 dark:bg-emerald-900/20
              text-emerald-700 dark:text-emerald-400
              hover:bg-emerald-100 dark:hover:bg-emerald-900/30
              transition-all duration-300
            "
          >
            عرض اللوحة كاملة
            <span>←</span>
          </button>
        </div>

        {/* Big card */}
        <div
          className="
            relative overflow-hidden
            rounded-2xl sm:rounded-3xl
            p-5 sm:p-8 md:p-10
            bg-white dark:bg-[#151515]
            border border-gray-200 dark:border-[#262626]
            shadow-sm
          "
        >
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8">

            {/* Buttons column (left side) */}
            <div className="flex flex-row md:flex-col gap-2.5 md:gap-3 order-2 md:order-2 flex-shrink-0 md:w-52 md:justify-center">
              <button
                onClick={() => transitionTo("/leaderboard")}
                className="
                  flex-1 md:flex-none
                  px-5 py-3 rounded-xl
                  font-black text-sm sm:text-base
                  bg-emerald-600 text-white
                  hover:bg-emerald-700
                  transition-all duration-300
                "
              >
                شوف اللي وصلوا
              </button>
              <button
                onClick={() => transitionTo("/dashboard/courses")}
                className="
                  flex-1 md:flex-none
                  px-5 py-3 rounded-xl
                  font-black text-sm sm:text-base
                  bg-transparent text-emerald-700 dark:text-emerald-400
                  border-2 border-emerald-600 dark:border-emerald-500
                  hover:bg-emerald-50 dark:hover:bg-emerald-900/20
                  transition-all duration-300
                "
              >
                ابدأ مذاكرة النهاردة
              </button>
            </div>

            {/* Content (right side): frame + text */}
            <div className="flex-1 order-1 md:order-1">
              <div className="flex flex-col md:flex-row items-center gap-6">

                {/* Frame image */}
                <div className="flex-shrink-0">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44">
                    <img
                      src="/images/frames/gold-frame.png"
                      alt="برواز لوحة الشرف"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Text side */}
                <div className="flex-1 text-center md:text-right">
                  <span
                    className="
                      inline-block mb-3 sm:mb-4
                      px-3.5 py-1.5 rounded-full
                      text-[11px] sm:text-xs font-black
                      bg-emerald-600 text-white
                    "
                  >
                    المكان ده مستنيك
                  </span>

                  <h2 className="text-lg sm:text-2xl md:text-[26px] font-black text-slate-900 dark:text-white mb-3 sm:mb-4">
                    ابدأ تجمع نقطك من دلوقتي!
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-7 sm:leading-8 mb-5 sm:mb-6">
                    قريبًا: كل امتحان وواجب تحله بدرجة حلوة هيجمعلك نقط، ولما نقطك تكفي هتاخد شارة فضية أو ذهبية أو ماسية، وأول 20 طالب هيتحطوا على المنصة.
                  </p>

                  {/* Stats row */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                    <div className="text-center md:text-right">
                      <p className="text-slate-900 dark:text-white font-black text-sm sm:text-base">ذاكر بانتظام</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">حضور واستمرار في الحصص</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-slate-900 dark:text-white font-black text-sm sm:text-base">حل الامتحانات</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">درجاتك هي تذكرتك للوحة</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-slate-900 dark:text-white font-black text-sm sm:text-base">اتفوق على نفسك</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">فضي، ذهبي، ماسي</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
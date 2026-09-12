import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";
import toast from "react-hot-toast";

export function LeaderboardPage() {
  const navigate = useNavigate();

  const showComingSoon = () => {
    toast("الميزة دي هتتاح قريبًا، تابعنا!");
  };

  return (
    <StudentLayout>
      <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="text-right order-2 sm:order-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#5800a9] dark:text-white mb-2">
              أبطال المنصة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-7 max-w-xl">
              أوائل طلابنا المتفوقون — ذاكر كويس و هات درجتك الكاملة في الامتحانات عشان تبقى من أوائل طلابنا!
            </p>
          </div>

          <button
            onClick={showComingSoon}
            className="
              order-1 sm:order-2
              flex-shrink-0
              inline-flex items-center gap-1.5
              px-4 py-2.5 rounded-xl
              text-sm font-bold
              bg-[#F6EEFF] dark:bg-[#2B103D]
              text-[#5800a9] dark:text-[#c9a6ff]
              hover:bg-[#EAD8FF] dark:hover:bg-[#3A1652]
              transition-all duration-300
            "
          >
            عرض اللوحة كاملة
            <span>←</span>
          </button>
        </div>

        {/* Big colored card */}
        <div
          className="
            relative overflow-hidden
            rounded-2xl sm:rounded-3xl
            p-5 sm:p-8 md:p-10
            bg-[#5800a9] dark:bg-[#b600d7]
          "
        >
          <div className="flex flex-col md:flex-row items-stretch gap-6 md:gap-8">

            {/* Buttons column (left side) */}
            <div className="flex flex-row md:flex-col gap-2.5 md:gap-3 order-2 md:order-2 flex-shrink-0 md:w-52 md:justify-center">
              <button
                onClick={showComingSoon}
                className="
                  flex-1 md:flex-none
                  px-5 py-3 rounded-xl
                  font-black text-sm sm:text-base
                  bg-[#b600d7] text-white
                  hover:opacity-90
                  transition-all duration-300
                "
              >
                شوف اللي وصلوا
              </button>
              <button
                onClick={() => navigate("/dashboard/courses")}
                className="
                  flex-1 md:flex-none
                  px-5 py-3 rounded-xl
                  font-black text-sm sm:text-base
                  bg-transparent text-white
                  border-2 border-[#b600d7]
                  hover:bg-[#b600d7]/10
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
                      src="/images/leaderboard-frame.png"
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
                      bg-[#b600d7] text-white
                    "
                  >
                    المكان ده مستنيك
                  </span>

                  <h2 className="text-lg sm:text-2xl md:text-[26px] font-black text-white mb-3 sm:mb-4">
                    اسمك مش على اللوحة... لسه!
                  </h2>

                  <p className="text-white/85 text-sm sm:text-base leading-7 sm:leading-8 mb-5 sm:mb-6">
            هنعرض هنا ترتيبك ونقاطك ومقارنتك بزمايلك، بعد إطلاق
            نظام النقاط والإنجازات داخل المنصة
                  </p>

                  {/* Stats row */}
                  <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                    <div className="text-center md:text-right">
                      <p className="text-white font-black text-sm sm:text-base">ذاكر بانتظام</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1">حضور واستمرار في الحصص</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-white font-black text-sm sm:text-base">حل الامتحانات</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1">درجاتك هي تذكرتك للوحة</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-white font-black text-sm sm:text-base">اتفوق على نفسك</p>
                      <p className="text-white/70 text-xs sm:text-sm mt-1">فضي، ذهبي، ماسي</p>
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
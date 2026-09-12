import { Swords, Trophy, Zap } from "lucide-react";

export default function ForumPage() {
  return (
    <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

      {/* Header */}
      <div className="text-right">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#5800a9] dark:text-white mb-2">
          بطولة الأسئلة
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base leading-7 max-w-xl">
          نافس زمايلك في حل الأسئلة واثبت إنك الأقوى في صفك الدراسي
        </p>
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
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

          {/* Icon side */}
          <div className="flex-shrink-0">
            <div
              className="
                w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40
                rounded-full
                bg-white/10
                flex items-center justify-center
              "
            >
              <Swords className="text-white w-12 h-12 sm:w-16 sm:h-16 md:w-[70px] md:h-[70px]" strokeWidth={1.75} />
            </div>
          </div>

          {/* Text side */}
          <div className="flex-1 text-center md:text-right">
            <span
              className="
                inline-block mb-3 sm:mb-4
                px-3.5 py-1.5 rounded-full
                text-[11px] sm:text-xs font-black
                bg-white/15 text-white
              "
            >
              قريبًا
            </span>

            <h2 className="text-lg sm:text-2xl md:text-[26px] font-black text-white mb-3 sm:mb-4" style={{ color: "#ffffff" }}>
              استعد للمنافسة!
            </h2>

            <p className="text-white text-sm sm:text-base leading-7 sm:leading-8 mb-5 sm:mb-6">
              هنطلق قريبًا مسابقة أسئلة مباشرة بين طلاب المنصة، كل طالب يتنافس مع زمايله في صفه الدراسي، وأكتر واحد يجمع نقط ويجاوب صح هيبقى بطل المنصة في صفه.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
              <div className="text-center md:text-right">
                <p className="font-black text-sm sm:text-base" style={{ color: "#ffffff" }}>منافسة مباشرة</p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "#ffffff" }}>تحدي حي بينك وبين زمايلك</p>
              </div>
              <div className="text-center md:text-right">
                <p className="font-black text-sm sm:text-base" style={{ color: "#ffffff" }}>بطل كل صف</p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "#ffffff" }}>لقب خاص لأقوى طالب في صفه</p>
              </div>
              <div className="text-center md:text-right">
                <p className="font-black text-sm sm:text-base" style={{ color: "#ffffff" }}>تحديث مستمر</p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: "#ffffff" }}>مسابقات وجولات جديدة بانتظام</p>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
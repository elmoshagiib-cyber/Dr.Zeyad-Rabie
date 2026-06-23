import { useState } from "react";
import {
  Plus,
  Minus,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "إزاي أقدر أشترك في الكورسات؟",
    answer:
      "قم بإنشاء حساب جديد ثم اختر الكورس المناسب وأكمل عملية الاشتراك بسهولة.",
  },
  {
    question: "هل الكورسات متاحة طول السنة؟",
    answer:
      "نعم، يمكنك الوصول للكورسات في أي وقت طوال فترة الإتاحة الخاصة بها.",
  },
  {
    question: "هل في متابعة وحل واجبات؟",
    answer:
      "يوجد متابعة مستمرة وواجبات واختبارات دورية لضمان أفضل مستوى للطالب.",
  },
  {
    question: "هل مسموح بمشاركة الحساب؟",
    answer:
      "لا، الحساب شخصي ومخصص لطالب واحد فقط حفاظاً على حقوق المحتوى.",
  },
  {
    question: "إزاي أتواصل مع الدعم الفني؟",
    answer:
      "يمكنك التواصل معنا مباشرة عبر الواتساب أو صفحة التواصل داخل المنصة.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
  className="
  relative
  overflow-hidden
  py-24
  bg-white
  dark:bg-[#09090B]
  "
>
      <div
  className="
  absolute
  top-0
  left-1/2
  -translate-x-1/2
  w-[900px]
  h-[500px]
  bg-[#A52DFF]/15
  blur-[180px]
  rounded-full
  pointer-events-none
  "
/>

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Title */}

        <div className="text-center mb-20">

          <div className="flex justify-center mb-5">
            
          </div>

<h1
  className="
  text-5xl
  lg:text-7xl
  font-black
  leading-tight
  "
>
  <span className="text-slate-900 dark:text-white">
    الأسئلة
  </span>

  <span
    className="
    mr-3
    inline-block
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    bg-clip-text
    text-transparent
    "
  >
    الشائعة
  </span>
</h1>

<p className="text-slate-600
dark:text-slate-400 text-xl max-w-2xl mx-auto">
كل ما تحتاج معرفته عن المنصة
</p>

<div className="flex justify-center items-center gap-4 mt-10">

  <div
    className="
    w-40
    h-[3px]
    rounded-full
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

  <div
    className="
    w-4
    h-4
    rotate-45
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

  <div
    className="
    w-40
    h-[3px]
    rounded-full
    bg-gradient-to-r
    from-[#7C1DCC]
    via-[#A52DFF]
    to-[#D900A8]
    "
  />

</div>

        </div>

        {/* FAQ */}

        <div className="space-y-6">

          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              whileHover={{
                y: -3,
              }}
              className="
overflow-hidden
rounded-[28px]
bg-white
dark:bg-[#130726]
border
border-slate-200
dark:border-white/10
shadow-lg
dark:shadow-[0_20px_50px_rgba(124,29,204,0.18)]
hover:-translate-y-1
transition-all
duration-500
"
            >
              <button
                onClick={() =>
                  setOpenIndex(
                    openIndex === index
                      ? null
                      : index
                  )
                }
                className="
                w-full
                flex
                items-center
                justify-between
                p-8
                text-right
                "
              >
                <div className="flex items-center gap-5">

                  <span
                    className="
                    text-[#7C3AED]
                    font-black
                    text-xl
                    "
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="
                    text-xl
                    lg:text-2xl
                    font-black
                    text-slate-900
                    dark:text-white
                    "
                  >
                    {faq.question}
                  </span>

                </div>

                <div
                  className="
                  w-12
                  h-12
                  rounded-full
                  bg-gradient-to-r
from-[#7C1DCC]
via-[#A52DFF]
to-[#D900A8]
text-white
                  flex
                  items-center
                  justify-center
                  "
                >
                  {openIndex === index ? (
                    <Minus size={22} />
                  ) : (
                    <Plus size={22} />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{
                      height: 0,
                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="overflow-hidden"
                  >
                    <div
                      className="
                      px-8
                      pb-8
                      text-lg
                      leading-relaxed
                      text-slate-700
                      dark:text-slate-300 
                      "
                    >
                      {faq.answer}
                    </div>
                    <div className="mx-8 border-t border-slate-200
dark:border-white/10 mb-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Footer Text */}

        <div className="text-center mt-14">
          <span className="text-slate-500">
            مش لقيت إجابة لسؤالك؟
          </span>

          <button
            className="
            mr-2
            text-blue-500
            font-black
            hover:underline
            "
          >
            تواصل معنا مباشرة
          </button>
        </div>
      </div>
    </section>
  );
}
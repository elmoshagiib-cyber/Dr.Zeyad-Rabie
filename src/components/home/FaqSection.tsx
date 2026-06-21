import { useState } from "react";
import {
  Plus,
  Minus,
  Atom,
  FlaskConical,
  Heart,
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
      py-32
      bg-gradient-to-br
      from-slate-50
      via-white
      to-violet-50
      dark:from-[#0b0715]
      dark:via-[#130726]
      dark:to-[#1a0930]
      "
    >
      {/* Background Effects */}

      <Atom
        size={220}
        className="
        absolute
        top-10
        right-10
        text-violet-500/10
        animate-spin
        "
        style={{
          animationDuration: "40s",
        }}
      />

      <FlaskConical
        size={140}
        className="
        absolute
        bottom-20
        left-10
        text-purple-400/10
        "
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">

        {/* Title */}

        <div className="text-center mb-20">

          <div className="flex justify-center mb-5">
            
          </div>

          <h2
            className="
            text-5xl
            lg:text-7xl
            font-black
            text-slate-900
            dark:text-white
            "
          >
            نحن هنا لتحقيق حلمك
          </h2>

          <h3
            className="
            mt-4
            text-3xl
            lg:text-5xl
            font-black
            text-[#7C3AED]
            "
          >
            أسئلة وأجوبة شائعة
          </h3>

          <p className="mt-6 text-slate-500 text-xl">
            كل ما تحتاج معرفته عن منصة مستر زياد ربيع
          </p>
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
              bg-white/80
              backdrop-blur-md
              border
              border-slate-200
              dark:bg-[#130726]/80
              dark:border-white/10
              shadow-lg
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
                    text-slate-800
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
                  bg-violet-100
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
                      text-slate-600
                      dark:text-slate-300
                      "
                    >
                      {faq.answer}
                    </div>
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
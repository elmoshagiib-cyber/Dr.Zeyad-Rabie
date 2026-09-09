import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { BookOpen, GraduationCap, Star, TrendingUp, LucideIcon } from "lucide-react";

interface FeatureCard {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: FeatureCard[] = [
  { icon: BookOpen, title: "شرح مبسط", description: "شرح بأسلوب سهل ومنظم يساعدك على فهم الكيمياء من أول مرة." },
  { icon: GraduationCap, title: "مراجعات شاملة", description: "مراجعات مركزة تغطي جميع أجزاء المنهج مع أهم الأفكار والأسئلة." },
  { icon: Star, title: "اختبارات تفاعلية", description: "اختبر مستواك بعد كل درس مع تصحيح فوري وتحليل للنتيجة." },
  { icon: TrendingUp, title: "متابعة مستمرة", description: "تابع تقدمك أولًا بأول واعرف نقاط القوة والضعف بسهولة." },
];

const LAYOUT = [
  { top: "0%", left: "0%", rotate: -3 },
  { top: "20%", left: "20%", rotate: 2 },
  { top: "42%", left: "2%", rotate: -2 },
  { top: "62%", left: "22%", rotate: 3 },
];

function FeatureCardItem({
  feature,
  index,
  progress,
  total,
}: {
  feature: FeatureCard;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const start = index / total;
  const end = (index + 1) / total;

  const bg = useTransform(progress, [start, end], ["#FFFFFF", "#B348FE"]);
  const titleColor = useTransform(progress, [start, end], ["#0f172a", "#FFFFFF"]);
  const descColor = useTransform(progress, [start, end], ["#64748b", "#F0E3FF"]);
  const iconWrapBg = useTransform(progress, [start, end], ["rgba(179,72,254,0.1)", "rgba(255,255,255,0.2)"]);
  const iconColor = useTransform(progress, [start, end], ["#B348FE", "#FFFFFF"]);
  const scale = useTransform(progress, [start, (start + end) / 2], [0.95, 1]);

  const Icon = feature.icon;
  const layout = LAYOUT[index % LAYOUT.length];

  return (
    <motion.div
      style={{ backgroundColor: bg, scale, rotate: layout.rotate, top: layout.top, left: layout.left }}
      className="
        absolute
        w-[260px] sm:w-[320px]
        rounded-3xl
        border border-gray-200 dark:border-[#262626]
        shadow-[0_15px_40px_rgba(0,0,0,.12)]
        p-5 sm:p-6
      "
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div
          style={{ backgroundColor: iconWrapBg, color: iconColor }}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center"
        >
          <Icon size={20} />
        </motion.div>
        <span className="text-xs font-bold text-gray-300">0{index + 1}</span>
      </div>
      <motion.h3 style={{ color: titleColor }} className="text-base sm:text-lg font-black mb-2">
        {feature.title}
      </motion.h3>
      <motion.p style={{ color: descColor }} className="text-xs sm:text-sm leading-6">
        {feature.description}
      </motion.p>
    </motion.div>
  );
}

export function WhyUsScrollSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={sectionRef} className="relative h-[350vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-white dark:bg-[#09090B] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-2 items-center gap-10">
          <div className="relative h-[420px] sm:h-[480px] order-2 lg:order-1">
            {FEATURES.map((feature, i) => (
              <FeatureCardItem
                key={feature.title}
                feature={feature}
                index={i}
                progress={scrollYProgress}
                total={FEATURES.length}
              />
            ))}
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-right">
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#B348FE]/10 text-[#B348FE] text-xs font-bold mb-4">
              الفكرة ببساطة
            </span>
            <h2 className="text-[26px] sm:text-[34px] lg:text-[42px] font-black text-slate-900 dark:text-white leading-tight mb-4">
              ليه تتعلم مع مستر زياد ربيع؟
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-[14px] sm:text-[16px] lg:text-[17px] leading-8 max-w-[480px] mx-auto lg:mx-0">
              كل حاجة بتترتب قدامك خطوة خطوة، من أول ما تبدأ لحد ما توصل لأعلى مستوى في الكيمياء.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
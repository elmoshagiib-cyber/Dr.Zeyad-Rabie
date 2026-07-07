import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type Props = {
  grade: string;
};

const gradeConfig: Record<
  string,
  {
    title: string;
    image: string;
    route: string;
  }
> = {
  first_sec: {
    title: "الصف الأول الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/first_sec",
  },
  "الصف الأول الثانوي": {
    title: "الصف الأول الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/first_sec",
  },

  second_sec: {
    title: "الصف الثاني الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/second_sec",
  },
  "الصف الثاني الثانوي": {
    title: "الصف الثاني الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/second_sec",
  },

  third_sec: {
    title: "الصف الثالث الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/third_sec",
  },
  "الصف الثالث الثانوي": {
    title: "الصف الثالث الثانوي",
    image: "/images/secondary-stage.jpg",
    route: "/grade/third_sec",
  },

  first_prep: {
    title: "الصف الأول الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/first_prep",
  },
  "الصف الأول الإعدادي": {
    title: "الصف الأول الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/first_prep",
  },

  second_prep: {
    title: "الصف الثاني الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/second_prep",
  },
  "الصف الثاني الإعدادي": {
    title: "الصف الثاني الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/second_prep",
  },

  third_prep: {
    title: "الصف الثالث الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/third_prep",
  },
  "الصف الثالث الإعدادي": {
    title: "الصف الثالث الإعدادي",
    image: "/images/prep-stage.jpg",
    route: "/grade/third_prep",
  },
};

export default function StudentGradeCard({ grade }: Props) {
  const navigate = useNavigate();

  const current = gradeConfig[grade];

  if (!current) return null;

  return (
    <div className="max-w-5xl mx-auto mt-20">
      <motion.div
        whileHover={{ y: -8 }}
        onClick={() => navigate(current.route)}
        className="cursor-pointer group"
      >
        <div className="relative overflow-hidden rounded-[30px] shadow-2xl">

          <img
            src={current.image}
            className="w-full h-[380px] object-cover transition duration-700 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          <div className="absolute bottom-10 right-10 text-white">
            <h2 className="text-4xl font-black">
              {current.title}
            </h2>

            <p className="mt-3 text-lg text-white/80">
              اضغط للدخول إلى كورسات صفك
            </p>

            <div className="mt-6 inline-flex items-center gap-2 font-bold">
              عرض الكورسات
              <ArrowLeft size={18} />
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
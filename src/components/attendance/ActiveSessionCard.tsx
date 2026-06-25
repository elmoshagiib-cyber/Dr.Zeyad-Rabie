import { motion } from "framer-motion";
import {
  QrCode,
  Users,
  Clock3,
  RotateCw,
  Power,
  Timer,
} from "lucide-react";

export function ActiveSessionCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-[32px] bg-white border border-slate-200 shadow-lg p-6"
    >
      {/* Header */}

      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-2">

          <span className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />

          <span className="text-green-700 text-sm font-bold">
            جلسة نشطة
          </span>

        </div>

        <div className="text-slate-400 text-sm">
          09:18 AM
        </div>

      </div>

      {/* Title */}

      <div className="mt-7">

        <h2 className="text-3xl font-black text-slate-900">
          الأسبوع الرابع
        </h2>

        <p className="mt-2 text-slate-500">
          الثالث الثانوي • الكيمياء العضوية
        </p>

      </div>

      {/* QR */}

      <div className="mt-8 flex justify-center">

        <div className="w-56 h-56 rounded-[32px] bg-slate-50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center">

          <QrCode
            size={95}
            className="text-blue-600"
          />

          <span className="mt-4 text-sm text-slate-500">
            QR CODE
          </span>

        </div>

      </div>

      {/* Timer */}

      <div className="mt-7 flex items-center justify-center gap-3">

        <Timer
          size={20}
          className="text-orange-500"
        />

        <span className="text-slate-500">
          يتغير خلال
        </span>

        <span className="font-black text-lg text-orange-600">
          00:24
        </span>

      </div>

      {/* Stats */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <div className="rounded-2xl bg-blue-50 p-4">

          <div className="flex items-center gap-2">

            <Users
              size={18}
              className="text-blue-600"
            />

            <span className="text-sm text-slate-600">
              الحاضرون
            </span>

          </div>

          <h3 className="mt-3 text-3xl font-black text-blue-700">
            287
          </h3>

        </div>

        <div className="rounded-2xl bg-orange-50 p-4">

          <div className="flex items-center gap-2">

            <Clock3
              size={18}
              className="text-orange-600"
            />

            <span className="text-sm text-slate-600">
              المتأخرون
            </span>

          </div>

          <h3 className="mt-3 text-3xl font-black text-orange-600">
            18
          </h3>

        </div>

      </div>

      {/* Buttons */}

      <div className="grid grid-cols-2 gap-4 mt-8">

        <button
          className="
          rounded-2xl
          bg-blue-600
          text-white
          py-3
          font-bold
          flex
          items-center
          justify-center
          gap-2
          transition-all
          hover:bg-blue-700
          hover:scale-[1.02]
          "
        >
          <RotateCw size={18} />

          تحديث QR
        </button>

        <button
          className="
          rounded-2xl
          bg-red-50
          text-red-600
          py-3
          font-bold
          flex
          items-center
          justify-center
          gap-2
          transition-all
          hover:bg-red-100
          "
        >
          <Power size={18} />

          إنهاء الجلسة
        </button>

      </div>
    </motion.div>
  );
}
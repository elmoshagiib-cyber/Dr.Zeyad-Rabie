import { BookOpen } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  courseTitle: string;
  onBack: () => void;
  onOpenSettings: () => void;
  onDelete: () => void;
  onSave: () => void;
  saving: boolean;
  saveSuccess: boolean;
};

export function EditCourseHeader({
  courseTitle,
  onBack,
  onOpenSettings,
  onDelete,
  onSave,
  saving,
  saveSuccess,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-r from-[#1547D6] to-[#3183FF] px-4 sm:px-6 lg:px-8 py-5 sm:py-6 text-white shadow-lg mx-4 sm:mx-6 mt-4 sm:mt-6"
    >
      <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full bg-white/10 blur-[100px] pointer-events-none" />
      <div className="absolute -right-20 bottom-0 w-56 h-56 rounded-full bg-white/10 blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        {/* العنوان والأيقونة */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-amber-400" size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">المحتوى</h1>
            <p className="text-white/60 text-xs sm:text-sm mt-0.5 truncate">{courseTitle || "بدون عنوان"}</p>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="hidden sm:inline">العودة</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-white/10 hover:bg-white/20 border border-white/15 backdrop-blur transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="hidden sm:inline">الإعدادات</span>
          </button>

          <button
            onClick={onDelete}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm bg-red-600 hover:bg-red-700 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            <span className="hidden sm:inline">حذف</span>
          </button>

          <button
            onClick={onSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm shadow-sm transition-all ${
              saveSuccess
                ? "bg-emerald-500 text-white"
                : "bg-white text-[#1547D6] hover:bg-white/90"
            } disabled:opacity-70 disabled:cursor-not-allowed`}
          >
            {saving ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                جاري الحفظ...
              </>
            ) : saveSuccess ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                تم الحفظ
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                حفظ التغييرات
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
interface LeaderboardStudent {
  student_id: number;
  full_name: string;
  avatar_url?: string | null;
  school_name?: string | null;
  phone?: string | null;
  leaderboard_note?: string | null;
  leaderboard_published?: boolean;
  points: number;
  badge: "gold" | "silver" | "diamond" | "none";
}

const badgeFrame: Record<string, string> = {
  gold: "/images/frames/gold-frame.png",
  silver: "/images/frames/silver-frame.png",
  diamond: "/images/frames/diamond-frame.png",
};

const badgeLabel: Record<string, string> = {
  gold: "الذهبية",
  silver: "الفضية",
  diamond: "الماسية",
  none: "لسه مأهلش",
};

const badgeLabelColor: Record<string, string> = {
  gold: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  silver: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  diamond: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  none: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
};

export function LeaderboardCard({
  student,
  showPhone = false,
  onEdit,
  onTogglePublish,
}: {
  student: LeaderboardStudent;
  showPhone?: boolean;
  onEdit?: () => void;
  onTogglePublish?: () => void;
}) {
  const hasFrame = student.badge !== "none";

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-full max-w-[200px] aspect-[3/3.6]">
        {hasFrame ? (
          <>
            <img
              src={badgeFrame[student.badge]}
              alt=""
              draggable={false}
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
            />
            <div className="absolute inset-[14%] top-[13%] bottom-[16%] rounded-sm overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img
                src={student.avatar_url || "/images/default-avatar.png"}
                alt={student.full_name}
                className="w-full h-full object-cover"
              />
            </div>
          </>
        ) : (
          <div className="absolute inset-[10%] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700">
            <img
              src={student.avatar_url || "/images/default-avatar.png"}
              alt={student.full_name}
              className="w-full h-full object-cover opacity-70"
            />
          </div>
        )}

        {onEdit && (
          <button
            onClick={onEdit}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#1547D6] hover:bg-[#0f38ad] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg transition-all"
          >
            تعديل
          </button>
        )}
      </div>

      <h3 className="mt-4 text-sm sm:text-base font-black text-slate-900 dark:text-white truncate max-w-[190px]">
        {student.full_name}
      </h3>

      {student.school_name && (
        <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 truncate max-w-[190px]">
          {student.school_name}
        </p>
      )}

      {showPhone && student.phone && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5" dir="ltr">
          {student.phone}
        </p>
      )}

      {student.leaderboard_note && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[190px] line-clamp-2">
          {student.leaderboard_note}
        </p>
      )}

      <span className={`inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-black ${badgeLabelColor[student.badge]}`}>
        {badgeLabel[student.badge]}
      </span>

      {onTogglePublish && (
        <button
          onClick={onTogglePublish}
          className={`mt-2 px-3 py-1.5 rounded-full text-[11px] font-black transition-all ${
            student.leaderboard_published
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200"
          }`}
        >
          {student.leaderboard_published ? "منشور ✓ (اضغط للإلغاء)" : "غير منشور (اضغط للنشر)"}
        </button>
      )}
    </div>
  );
}
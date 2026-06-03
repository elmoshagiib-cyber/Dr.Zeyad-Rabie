import { useState } from "react";
import { Bell, BookOpen, FileText, Trophy, AlertCircle, Info, ChevronDown } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Badge } from "../../components/ui/Badge";
import { ANNOUNCEMENTS } from "../../data/mockData";

const typeConfig: Record<string, { label: string; icon: React.ReactNode; badge: string; border: string; bg: string }> = {
  lesson: { label: "درس جديد", icon: <BookOpen size={16} />, badge: "blue", border: "border-blue-500", bg: "bg-blue-50" },
  exam: { label: "امتحان", icon: <AlertCircle size={16} />, badge: "rose", border: "border-rose-500", bg: "bg-rose-50" },
  homework: { label: "واجب", icon: <FileText size={16} />, badge: "amber", border: "border-amber-500", bg: "bg-amber-50" },
  result: { label: "نتائج", icon: <Trophy size={16} />, badge: "emerald", border: "border-emerald-500", bg: "bg-emerald-50" },
  general: { label: "عام", icon: <Info size={16} />, badge: "slate", border: "border-slate-400", bg: "bg-slate-50" },
};

export function AnnouncementsPage() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filters = [
    { key: "all", label: "الكل" },
    { key: "lesson", label: "دروس" },
    { key: "exam", label: "امتحانات" },
    { key: "homework", label: "واجبات" },
    { key: "result", label: "نتائج" },
    { key: "general", label: "عامة" },
  ];

  const filtered = filter === "all" ? ANNOUNCEMENTS : ANNOUNCEMENTS.filter(a => a.type === filter);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <Bell size={20} className="text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">الإعلانات</h1>
              <p className="text-slate-500 text-sm">{ANNOUNCEMENTS.filter(a => a.isNew).length} إعلانات جديدة</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filters.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filter === f.key
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          <div className="space-y-3">
            {filtered.map(ann => {
              const config = typeConfig[ann.type] || typeConfig.general;
              const isExpanded = expanded === ann.id;
              return (
                <div
                  key={ann.id}
                  className={`bg-white rounded-2xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-md ${ann.isNew ? "ring-2 ring-blue-200" : ""}`}
                >
                  <button
                    onClick={() => setExpanded(isExpanded ? null : ann.id)}
                    className="w-full p-5 text-right"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                        <div className={ann.type === "lesson" ? "text-blue-600" : ann.type === "exam" ? "text-rose-600" : ann.type === "homework" ? "text-amber-600" : ann.type === "result" ? "text-emerald-600" : "text-slate-600"}>
                          {config.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {ann.isNew && (
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">جديد</span>
                          )}
                          <Badge variant={config.badge as any}>{config.label}</Badge>
                          {ann.courseTitle && (
                            <span className="text-xs text-slate-400">— {ann.courseTitle}</span>
                          )}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm leading-tight mb-1">{ann.title}</h3>
                        <p className="text-xs text-slate-400">{ann.publishedAt}</p>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`text-slate-400 flex-shrink-0 transition-transform mt-1 ${isExpanded ? "rotate-180" : ""}`}
                      />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className={`border-t border-slate-100 px-5 py-4 ${config.bg}`}>
                      <p className="text-slate-700 text-sm leading-relaxed">{ann.content}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">📭</div>
              <p className="text-xl font-bold text-slate-700 mb-1">لا توجد إعلانات</p>
              <p className="text-slate-500 text-sm">لا توجد إعلانات في هذه الفئة حتى الآن</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Pause, Volume2, Maximize2, ChevronRight, ChevronLeft, CheckCircle, Lock, FileText, Download, BookOpen, List, X } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { COURSES } from "../../data/mockData";

export function LessonPlayer() {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(45);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState<"lessons" | "materials">("lessons");
  const [completed, setCompleted] = useState(false);

  const course = COURSES[0];
  const unit = course.units[0];
  const currentLesson = unit.lessons[2]; // Lesson 3

  const materials = [
    { name: "ملخص الكيمياء العضوية", type: "PDF", size: "2.4 MB", icon: "📄" },
    { name: "أوراق عمل الوحدة الأولى", type: "PDF", size: "1.8 MB", icon: "📋" },
    { name: "جدول المجموعات الوظيفية", type: "PDF", size: "0.9 MB", icon: "📊" },
  ];

  return (
    <div className="flex h-screen bg-slate-900 overflow-hidden" dir="rtl">
      {/* Nav Sidebar */}
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="student" />
      </div>

      {/* Player Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              <ChevronRight size={18} />
            </button>
            <div>
              <p className="text-white font-bold text-sm">{currentLesson.title}</p>
              <p className="text-slate-400 text-xs">{course.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="blue">{unit.title}</Badge>
            <button onClick={() => setShowSidebar(!showSidebar)} className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-700 transition-colors">
              <List size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Video & Content */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Video Player */}
            <div className="bg-black relative group" style={{ aspectRatio: "16/9" }}>
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                {/* Chemistry visual */}
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-pulse">⚗️</div>
                  <p className="text-white font-bold text-lg mb-1">الهيدروكربونات الحلقية</p>
                  <p className="text-slate-400 text-sm">الكيمياء العضوية — الجزء الثالث</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }}></div>
              </div>

              {/* Controls overlay */}
              <div className="absolute bottom-4 left-0 right-0 px-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center justify-between bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setPlaying(!playing)}
                      className="w-9 h-9 bg-white dark:bg-[#130726] rounded-full flex items-center justify-center hover:scale-110 transition-transform"
                    >
                      {playing ? <Pause size={16} className="text-slate-900" /> : <Play size={16} className="text-slate-900 mr-[-2px]" />}
                    </button>
                    <span className="text-white text-xs font-mono">14:32 / 41:05</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-white/80 hover:text-white"><Volume2 size={16} /></button>
                    <button className="text-white/80 hover:text-white"><Maximize2 size={16} /></button>
                  </div>
                </div>
              </div>

              {/* Play Button */}
              <button
                onClick={() => setPlaying(!playing)}
                className="absolute inset-0 flex items-center justify-center group/play"
              >
                <div className={`w-16 h-16 bg-white dark:bg-[#130726]/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 hover:bg-white dark:bg-[#130726]/30 transition-all ${playing ? "opacity-0" : "opacity-100"}`}>
                  <Play size={24} className="text-white mr-[-2px]" />
                </div>
              </button>
            </div>

            {/* Lesson Info */}
            <div className="p-6 bg-white dark:bg-[#130726] border-b border-slate-200">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 mb-1">{currentLesson.title}</h1>
                    <p className="text-slate-500 text-sm">{unit.title} — الدرس 3 من 6</p>
                  </div>
                  <Button
                    variant={completed ? "success" : "primary"}
                    size="sm"
                    onClick={() => setCompleted(!completed)}
                  >
                    <CheckCircle size={15} />
                    {completed ? "تم الإكمال" : "وضع علامة مكتمل"}
                  </Button>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  في هذا الدرس سنتعرف على الهيدروكربونات الحلقية وخصائصها، مع التركيز على البنزين وخواصه الكيميائية الفريدة. سنشرح أيضاً تفاعلات الإحلال الإلكتروفيلي والأنواع المختلفة من المركبات الحلقية.
                </p>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-slate-200 mb-4">
                  {[
                    { key: "lessons", label: "الدروس" },
                    { key: "materials", label: "المواد التعليمية" },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${
                        activeTab === tab.key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "materials" && (
                  <div className="space-y-3">
                    {materials.map((mat, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all group">
                        <span className="text-2xl">{mat.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-sm">{mat.name}</p>
                          <p className="text-xs text-slate-500">{mat.type} • {mat.size}</p>
                        </div>
                        <button className="flex items-center gap-1.5 text-blue-600 text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download size={15} />
                          تحميل
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "lessons" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate("/dashboard/lesson/l2")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      <ChevronRight size={16} />
                      الدرس السابق
                    </button>
                    <button
                      onClick={() => navigate("/dashboard/quiz")}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors mr-auto"
                    >
                      الدرس التالي
                      <ChevronLeft size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Lesson List */}
          {showSidebar && (
            <div className="w-80 bg-white dark:bg-[#130726] border-r border-slate-200 overflow-y-auto flex-shrink-0">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-sm">محتوى الكورس</h3>
                <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-slate-600 lg:hidden">
                  <X size={16} />
                </button>
              </div>
              {course.units.map((u, ui) => (
                <div key={u.id}>
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <p className="text-xs font-black text-slate-600">{u.title}</p>
                    <p className="text-xs text-slate-400">{u.lessons.length} دروس</p>
                  </div>
                  {u.lessons.map((lesson, li) => {
                    const isCurrent = lesson.id === "l3";
                    return (
                      <div
                        key={lesson.id}
                        className={`px-4 py-3 border-b border-slate-100 flex items-center gap-3 cursor-pointer transition-colors ${isCurrent ? "bg-blue-50 border-r-2 border-r-blue-600" : "hover:bg-slate-50"}`}
                      >
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                          {lesson.type === "quiz" ? (
                            <FileText size={13} className="text-violet-500" />
                          ) : lesson.isCompleted ? (
                            <CheckCircle size={13} className="text-emerald-500" />
                          ) : !lesson.isFree && !isCurrent ? (
                            <Lock size={13} className="text-slate-400" />
                          ) : (
                            <Play size={13} className={isCurrent ? "text-blue-600" : "text-slate-400"} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-medium leading-tight truncate ${isCurrent ? "text-blue-700 font-bold" : "text-slate-700"}`}>
                            {lesson.title}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lesson.duration}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

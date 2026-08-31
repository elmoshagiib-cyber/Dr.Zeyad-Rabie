import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../lib/supabase";
import { useApp } from "../../context/AppContext";
import {
  TrendingUp,
  Users,
  UserX,
  Eye,
  CheckCircle,
  Search,
  Phone,
  AlertCircle,
  UserCheck,
  Filter,
  RotateCcw,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

interface ProgressRecord {
  enrollment_id: string;
  student_id: string;
  full_name: string;
  phone: string | null;
  whatsapp_number: string | null;
  course_id: string;
  course_title: string;
  enrolled_at: string;
  require_completion: boolean;
  total_lessons: number;
  completed_lessons: number;
  completion_percentage: number;
  bypassed_count: number;
  last_watch_position: number | null;
  last_watched_at: string | null;
}

type FilterType = "all" | "not_started" | "partial" | "bypassed" | "completed";

interface CourseOption {
  id: string;
  title: string;
}

export function InstructorWatchProgress() {
  const { user } = useApp();

  const [data, setData] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<CourseOption[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // جلب الكورسات
  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title");
    setCourses((coursesData as CourseOption[]) || []);
  }

  // جلب البيانات
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      let query = supabase
        .from("instructor_progress_view")
        .select("*");

      if (selectedCourse !== "all") {
        query = query.eq("course_id", selectedCourse);
      }

      if (dateFrom) {
        query = query.gte("enrolled_at", dateFrom);
      }

      if (dateTo) {
        query = query.lte("enrolled_at", dateTo + "T23:59:59");
      }

      const { data: viewData, error } = await query.order("enrolled_at", {
        ascending: false,
      });

      if (error) throw error;
      setData(viewData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // الفلاتر
  const filteredData = useMemo(() => {
    let result = data;

    // بحث بالاسم أو الموبايل
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.phone?.includes(q) ||
          r.whatsapp_number?.includes(q)
      );
    }

    // فلتر حسب الحالة
    if (filterType !== "all") {
      result = result.filter((r) => {
        const pct = r.completion_percentage || 0;
        if (filterType === "not_started") return pct === 0;
        if (filterType === "partial") return pct > 0 && pct < 100;
        if (filterType === "bypassed") return r.bypassed_count > 0;
        if (filterType === "completed") return pct === 100;
        return true;
      });
    }

    return result;
  }, [data, searchQuery, filterType]);

  // الإحصائيات
  const stats = useMemo(() => {
    const total = data.length;
    const notStarted = data.filter((r) => r.completion_percentage === 0).length;
    const partial = data.filter(
      (r) => r.completion_percentage > 0 && r.completion_percentage < 100
    ).length;
    const bypassed = data.filter((r) => r.bypassed_count > 0).length;
    const completed = data.filter((r) => r.completion_percentage === 100)
      .length;

    return { total, notStarted, partial, bypassed, completed };
  }, [data]);

  const resetFilters = () => {
    setSelectedCourse("all");
    setDateFrom("");
    setDateTo("");
    setFilterType("all");
    setSearchQuery("");
    setTimeout(fetchData, 0);
  };

  return (
    <div
      className="flex h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#09090B] dark:via-[#111111] dark:to-[#09090B]"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
          {/* العنوان */}
          <div>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1">
              مركز متابعة المشاهدة
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              تتبع تقدم الطلاب في الكورسات
            </p>
          </div>

          {/* الكروت الإحصائية */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              {
                label: "متجاوزون",
                value: stats.bypassed,
                icon: UserCheck,
                gradient: "from-yellow-400 to-orange-500",
              },
              {
                label: "لم يفتحوا",
                value: stats.notStarted,
                icon: UserX,
                gradient: "from-red-400 to-pink-500",
              },
              {
                label: "مشاهدة جزئية",
                value: stats.partial,
                icon: Eye,
                gradient: "from-blue-400 to-indigo-500",
              },
              {
                label: "أكملوا",
                value: stats.completed,
                icon: CheckCircle,
                gradient: "from-green-400 to-emerald-500",
              },
              {
                label: "إجمالي",
                value: stats.total,
                icon: Users,
                gradient: "from-purple-400 to-pink-500",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
                        {stat.label}
                      </p>
                      <p className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mt-1">
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* الفلاتر */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
            <CardContent className="p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-4">
                {/* الكورس */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الكورس:
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                  >
                    <option value="all">-- كل الكورسات --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* الفترة من */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الفترة من:
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                  />
                </div>

                {/* الفترة إلى */}
                <div>
                  <label className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1.5 block">
                    الفترة إلى:
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full h-11 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] px-3 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                  />
                </div>

                {/* أزرار التحكم */}
                <div className="flex gap-2">
                  <Button
                    onClick={fetchData}
                    className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl font-bold h-11"
                  >
                    <Filter size={16} className="ml-1.5" />
                    تطبيق الفلاتر
                  </Button>
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="rounded-xl font-bold h-11 px-3"
                  >
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>

              {/* فلاتر إضافية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* بحث */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="ابحث بالاسم أو الموبايل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3 border border-gray-200 dark:border-[#2A2A2A] rounded-xl bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                  />
                </div>

                {/* الحالة */}
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as FilterType)}
                  className="px-4 py-3 border border-gray-200 dark:border-[#2A2A2A] rounded-xl bg-white dark:bg-[#1A1A1A] text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#B348FE]"
                >
                  <option value="all">كل الحالات</option>
                  <option value="not_started">لم يبدأوا</option>
                  <option value="partial">مشاهدة جزئية</option>
                  <option value="bypassed">تم تجاوزهم</option>
                  <option value="completed">أكملوا</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* الجدول */}
          <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-24 text-center">
                  <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-bold text-sm">
                    جاري التحميل...
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-[#B348FE] to-purple-600 text-white">
                      <tr>
                        <th className="px-4 py-3 text-right font-bold">#</th>
                        <th className="px-4 py-3 text-right font-bold">
                          الطالب
                        </th>
                        <th className="px-4 py-3 text-right font-bold">
                          الكورس
                        </th>
                        <th className="px-4 py-3 text-right font-bold">
                          التقدم
                        </th>
                        <th className="px-4 py-3 text-right font-bold">
                          الحالة
                        </th>
                        <th className="px-4 py-3 text-right font-bold">
                          آخر مشاهدة
                        </th>
                        <th className="px-4 py-3 text-right font-bold">
                          تواصل
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-[#2A2A2A]">
                      {filteredData.map((row, idx) => {
                        const pct = row.completion_percentage || 0;
                        let statusColor = "bg-gray-100 text-gray-700";
                        let statusLabel = "جديد";

                        if (pct === 100) {
                          statusColor =
                            "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
                          statusLabel = "مكتمل";
                        } else if (row.bypassed_count > 0) {
                          statusColor =
                            "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
                          statusLabel = "متجاوز";
                        } else if (pct > 0) {
                          statusColor =
                            "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
                          statusLabel = "جاري";
                        }

                        return (
                          <tr
                            key={idx}
                            className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                          >
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">
                                  {row.full_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {row.phone || "—"}
                                </p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                              {row.course_title}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 dark:bg-[#2A2A2A] rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-[#B348FE] to-purple-600 h-2 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 min-w-[45px]">
                                  {pct}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {row.completed_lessons}/{row.total_lessons}{" "}
                                محاضرة
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold ${statusColor}`}
                              >
                                {statusLabel}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                              {row.last_watched_at
                                ? new Date(
                                    row.last_watched_at
                                  ).toLocaleDateString("ar-EG")
                                : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                {row.whatsapp_number && (
                                  <a
                                    href={`https://wa.me/${row.whatsapp_number}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                                  >
                                    <FaWhatsapp className="w-5 h-5 text-green-600 dark:text-green-400" />
                                  </a>
                                )}
                                {row.phone && (
                                  <a
                                    href={`tel:${row.phone}`}
                                    className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                  >
                                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                  </a>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredData.length === 0 && (
                    <div className="py-12 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                      <p className="text-gray-500 dark:text-gray-400 font-bold">
                        لا توجد بيانات
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
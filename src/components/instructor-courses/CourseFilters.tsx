import {
  Search,
  RotateCcw,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

type Props = {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;

  gradeFilter: string;
  setGradeFilter: Dispatch<SetStateAction<string>>;

  statusFilter: string;
  setStatusFilter: Dispatch<SetStateAction<string>>;

  sortBy: string;
  setSortBy: Dispatch<SetStateAction<string>>;

  view: "grid" | "list";
  setView: Dispatch<SetStateAction<"grid" | "list">>;

  resultsCount: number;
};

export function CourseFilters({
  search,
  setSearch,
  gradeFilter,
  setGradeFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  view,
  setView,
  resultsCount,
}: Props) {
  const selectClass = `
w-full
h-12
rounded-2xl
border
border-slate-200
bg-white
px-4
outline-none
transition
shadow-sm
focus:border-violet-600
focus:ring-4
focus:ring-violet-100
`;

  const activeFilters =
    (gradeFilter !== "all" ? 1 : 0) +
    (statusFilter !== "all" ? 1 : 0);

  return (
    <div className="bg-white rounded-[30px] border border-slate-200 shadow-sm p-7">

      {/* Header */}

      <div className="flex items-center justify-between mb-7">

        <div className="text-right">
          <h2 className="text-2xl font-black">
            فلتر الكورسات
          </h2>

          <p className="text-slate-500 mt-1">
            ابحث ورتب واعرض الكورسات بالطريقة المناسبة.
          </p>
        </div>

        <div className="inline-flex items-center justify-center min-w-[95px] h-11 rounded-full bg-violet-100 text-violet-700 font-bold">
          {resultsCount} كورس
        </div>

      </div>

      {/* Row */}

      <div className="
flex
flex-col
lg:flex-row
gap-4
items-stretch
lg:items-center
">

        {/* Search */}

        <div className="relative w-full lg:flex-1">

          <Search
            size={18}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="ابحث باسم الكورس أو الوصف..."
            className="
w-full
h-12
rounded-2xl
border
border-slate-200
pr-11
pl-4
shadow-sm
transition
outline-none
focus:border-violet-600
focus:ring-4
focus:ring-violet-100
"
          />

        </div>

        {/* Grade */}

       <div className="w-full lg:w-[210px]">

          <select
            value={gradeFilter}
            onChange={(e) =>
              setGradeFilter(e.target.value)
            }
            className={selectClass}
          >
            <option value="all">
              كل الصفوف
            </option>

            <option value="الصف الأول الإعدادي">
  الصف الأول الإعدادي
</option>

<option value="الصف الثاني الإعدادي">
  الصف الثاني الإعدادي
</option>

<option value="الصف الثالث الإعدادي">
  الصف الثالث الإعدادي
</option>

<option value="الصف الأول الثانوي">
  الصف الأول الثانوي
</option>

<option value="الصف الثاني الثانوي">
  الصف الثاني الثانوي
</option>

<option value="الصف الثالث الثانوي">
  الصف الثالث الثانوي
</option>

          </select>

        </div>

        {/* Status */}

        <div className="w-full lg:w-[180px]">

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className={selectClass}
          >

            <option value="published">
              منشور
            </option>

            <option value="draft">
              مسودة
            </option>

          </select>

        </div>

        {/* Sort */}

        <div className="w-full lg:w-[170px]">

          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value)
            }
            className={selectClass}
          >
            <option value="latest">
              الأحدث
            </option>

            <option value="oldest">
              الأقدم
            </option>

            <option value="price-low">
              السعر الأقل
            </option>

            <option value="price-high">
              السعر الأعلى
            </option>

          </select>

        </div>


        {/* Reset */}

<div className="flex items-center gap-3">
  <button
    onClick={() => {
      setSearch("");
      setGradeFilter("all");
      setStatusFilter("all");
      setSortBy("latest");
    }}
    className="
      h-11
      px-5
      rounded-xl
      border
      border-slate-200
      hover:bg-slate-50
      transition
      flex
      items-center
      gap-2
      text-sm
      font-medium
    "
  >
    <RotateCcw size={16} />
    إعادة الضبط
  </button>

</div>
</div>
      {/* Footer */}

      <div className="mt-6 flex items-center justify-between">

        <div className="flex gap-2 flex-wrap">

          {gradeFilter !== "all" && (
            <button
              onClick={() =>
                setGradeFilter("all")
              }
              className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-sm"
            >
              {gradeFilter} ✕
            </button>
          )}

          {statusFilter !== "all" && (
            <button
              onClick={() =>
                setStatusFilter("all")
              }
              className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm"
            >
              {statusFilter === "published"
                ? "منشور"
                : "مسودة"} ✕
            </button>
          )}

        </div>

        {activeFilters > 0 && (
          <span className="text-sm text-slate-500">
            {activeFilters} فلتر مفعل
          </span>
        )}

      </div>

    </div>
  );
}
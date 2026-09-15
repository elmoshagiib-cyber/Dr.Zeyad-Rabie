import { useState } from "react";
import { FlaskConical, X } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";

type Category =
  | "alkali" | "alkaline-earth" | "transition" | "post-transition"
  | "metalloid" | "nonmetal" | "halogen" | "noble-gas"
  | "lanthanide" | "actinide" | "unknown";

const CATEGORY_INFO: Record<Category, { label: string; bg: string }> = {
  "alkali":            { label: "فلز قلوي",              bg: "#f9c9d3" },
  "alkaline-earth":    { label: "فلز قلوي ترابي",         bg: "#fbd9a5" },
  "transition":        { label: "فلز انتقالي",            bg: "#fde49a" },
  "metalloid":         { label: "شبه فلز",                bg: "#a8ddc7" },
  "halogen":           { label: "هالوجين",                bg: "#f5eca0" },
  "noble-gas":         { label: "غاز نبيل",                bg: "#d6bdf0" },
  "lanthanide":        { label: "لانثانيدات",              bg: "#f6c9a0" },
  "actinide":          { label: "أكتينيدات",               bg: "#f4b3b8" },
  "nonmetal":          { label: "لا فلز آخر",              bg: "#c8e6b0" },
  "post-transition":   { label: "فلز ما بعد الانتقال",     bg: "#b9d8f2" },
  "unknown":           { label: "غير معروف",               bg: "#d4d4d8" },
};

interface Elem { number: number; symbol: string; name: string; category: Category; row: number; col: number; }

const ELEMENTS: Elem[] = [
  { number: 1, symbol: "H", name: "هيدروجين", category: "nonmetal", row: 1, col: 1 },
  { number: 2, symbol: "He", name: "هيليوم", category: "noble-gas", row: 1, col: 18 },

  { number: 3, symbol: "Li", name: "ليثيوم", category: "alkali", row: 2, col: 1 },
  { number: 4, symbol: "Be", name: "بيريليوم", category: "alkaline-earth", row: 2, col: 2 },
  { number: 5, symbol: "B", name: "بورون", category: "metalloid", row: 2, col: 13 },
  { number: 6, symbol: "C", name: "كربون", category: "nonmetal", row: 2, col: 14 },
  { number: 7, symbol: "N", name: "نيتروجين", category: "nonmetal", row: 2, col: 15 },
  { number: 8, symbol: "O", name: "أكسجين", category: "nonmetal", row: 2, col: 16 },
  { number: 9, symbol: "F", name: "فلور", category: "halogen", row: 2, col: 17 },
  { number: 10, symbol: "Ne", name: "نيون", category: "noble-gas", row: 2, col: 18 },

  { number: 11, symbol: "Na", name: "صوديوم", category: "alkali", row: 3, col: 1 },
  { number: 12, symbol: "Mg", name: "ماغنيسيوم", category: "alkaline-earth", row: 3, col: 2 },
  { number: 13, symbol: "Al", name: "ألومنيوم", category: "post-transition", row: 3, col: 13 },
  { number: 14, symbol: "Si", name: "سيليكون", category: "metalloid", row: 3, col: 14 },
  { number: 15, symbol: "P", name: "فسفور", category: "nonmetal", row: 3, col: 15 },
  { number: 16, symbol: "S", name: "كبريت", category: "nonmetal", row: 3, col: 16 },
  { number: 17, symbol: "Cl", name: "كلور", category: "halogen", row: 3, col: 17 },
  { number: 18, symbol: "Ar", name: "أرجون", category: "noble-gas", row: 3, col: 18 },

  { number: 19, symbol: "K", name: "بوتاسيوم", category: "alkali", row: 4, col: 1 },
  { number: 20, symbol: "Ca", name: "كالسيوم", category: "alkaline-earth", row: 4, col: 2 },
  { number: 21, symbol: "Sc", name: "سكانديوم", category: "transition", row: 4, col: 3 },
  { number: 22, symbol: "Ti", name: "تيتانيوم", category: "transition", row: 4, col: 4 },
  { number: 23, symbol: "V", name: "فاناديوم", category: "transition", row: 4, col: 5 },
  { number: 24, symbol: "Cr", name: "كروم", category: "transition", row: 4, col: 6 },
  { number: 25, symbol: "Mn", name: "منجنيز", category: "transition", row: 4, col: 7 },
  { number: 26, symbol: "Fe", name: "حديد", category: "transition", row: 4, col: 8 },
  { number: 27, symbol: "Co", name: "كوبالت", category: "transition", row: 4, col: 9 },
  { number: 28, symbol: "Ni", name: "نيكل", category: "transition", row: 4, col: 10 },
  { number: 29, symbol: "Cu", name: "نحاس", category: "transition", row: 4, col: 11 },
  { number: 30, symbol: "Zn", name: "زنك", category: "transition", row: 4, col: 12 },
  { number: 31, symbol: "Ga", name: "غاليوم", category: "post-transition", row: 4, col: 13 },
  { number: 32, symbol: "Ge", name: "جرمانيوم", category: "metalloid", row: 4, col: 14 },
  { number: 33, symbol: "As", name: "زرنيخ", category: "metalloid", row: 4, col: 15 },
  { number: 34, symbol: "Se", name: "سيلينيوم", category: "nonmetal", row: 4, col: 16 },
  { number: 35, symbol: "Br", name: "بروم", category: "halogen", row: 4, col: 17 },
  { number: 36, symbol: "Kr", name: "كريبتون", category: "noble-gas", row: 4, col: 18 },

  { number: 37, symbol: "Rb", name: "روبيديوم", category: "alkali", row: 5, col: 1 },
  { number: 38, symbol: "Sr", name: "سترونشيوم", category: "alkaline-earth", row: 5, col: 2 },
  { number: 39, symbol: "Y", name: "إتريوم", category: "transition", row: 5, col: 3 },
  { number: 40, symbol: "Zr", name: "زركونيوم", category: "transition", row: 5, col: 4 },
  { number: 41, symbol: "Nb", name: "نيوبيوم", category: "transition", row: 5, col: 5 },
  { number: 42, symbol: "Mo", name: "موليبديوم", category: "transition", row: 5, col: 6 },
  { number: 43, symbol: "Tc", name: "تكنيشيوم", category: "transition", row: 5, col: 7 },
  { number: 44, symbol: "Ru", name: "روثينيوم", category: "transition", row: 5, col: 8 },
  { number: 45, symbol: "Rh", name: "روديوم", category: "transition", row: 5, col: 9 },
  { number: 46, symbol: "Pd", name: "بالاديوم", category: "transition", row: 5, col: 10 },
  { number: 47, symbol: "Ag", name: "فضة", category: "transition", row: 5, col: 11 },
  { number: 48, symbol: "Cd", name: "كادميوم", category: "transition", row: 5, col: 12 },
  { number: 49, symbol: "In", name: "إنديوم", category: "post-transition", row: 5, col: 13 },
  { number: 50, symbol: "Sn", name: "قصدير", category: "post-transition", row: 5, col: 14 },
  { number: 51, symbol: "Sb", name: "إثمد", category: "metalloid", row: 5, col: 15 },
  { number: 52, symbol: "Te", name: "تيلوريوم", category: "metalloid", row: 5, col: 16 },
  { number: 53, symbol: "I", name: "يود", category: "halogen", row: 5, col: 17 },
  { number: 54, symbol: "Xe", name: "زينون", category: "noble-gas", row: 5, col: 18 },

  { number: 55, symbol: "Cs", name: "سيزيوم", category: "alkali", row: 6, col: 1 },
  { number: 56, symbol: "Ba", name: "باريوم", category: "alkaline-earth", row: 6, col: 2 },
  { number: 72, symbol: "Hf", name: "هافنيوم", category: "transition", row: 6, col: 4 },
  { number: 73, symbol: "Ta", name: "تانتالوم", category: "transition", row: 6, col: 5 },
  { number: 74, symbol: "W", name: "تنجستن", category: "transition", row: 6, col: 6 },
  { number: 75, symbol: "Re", name: "رينيوم", category: "transition", row: 6, col: 7 },
  { number: 76, symbol: "Os", name: "أوزميوم", category: "transition", row: 6, col: 8 },
  { number: 77, symbol: "Ir", name: "إيريديوم", category: "transition", row: 6, col: 9 },
  { number: 78, symbol: "Pt", name: "بلاتين", category: "transition", row: 6, col: 10 },
  { number: 79, symbol: "Au", name: "ذهب", category: "transition", row: 6, col: 11 },
  { number: 80, symbol: "Hg", name: "زئبق", category: "transition", row: 6, col: 12 },
  { number: 81, symbol: "Tl", name: "ثاليوم", category: "post-transition", row: 6, col: 13 },
  { number: 82, symbol: "Pb", name: "رصاص", category: "post-transition", row: 6, col: 14 },
  { number: 83, symbol: "Bi", name: "بزموت", category: "post-transition", row: 6, col: 15 },
  { number: 84, symbol: "Po", name: "بولونيوم", category: "metalloid", row: 6, col: 16 },
  { number: 85, symbol: "At", name: "أستاتين", category: "halogen", row: 6, col: 17 },
  { number: 86, symbol: "Rn", name: "رادون", category: "noble-gas", row: 6, col: 18 },

  { number: 87, symbol: "Fr", name: "فرانسيوم", category: "alkali", row: 7, col: 1 },
  { number: 88, symbol: "Ra", name: "راديوم", category: "alkaline-earth", row: 7, col: 2 },
  { number: 104, symbol: "Rf", name: "رذرفوردیوم", category: "transition", row: 7, col: 4 },
  { number: 105, symbol: "Db", name: "دوبنيوم", category: "transition", row: 7, col: 5 },
  { number: 106, symbol: "Sg", name: "سيبورجيوم", category: "transition", row: 7, col: 6 },
  { number: 107, symbol: "Bh", name: "بوريوم", category: "transition", row: 7, col: 7 },
  { number: 108, symbol: "Hs", name: "هاسيوم", category: "transition", row: 7, col: 8 },
  { number: 109, symbol: "Mt", name: "مايتنيريوم", category: "unknown", row: 7, col: 9 },
  { number: 110, symbol: "Ds", name: "دارمشتاتيوم", category: "unknown", row: 7, col: 10 },
  { number: 111, symbol: "Rg", name: "رونتجينيوم", category: "unknown", row: 7, col: 11 },
  { number: 112, symbol: "Cn", name: "كوبرنيسيوم", category: "unknown", row: 7, col: 12 },
  { number: 113, symbol: "Nh", name: "نيهونيوم", category: "unknown", row: 7, col: 13 },
  { number: 114, symbol: "Fl", name: "فليروفيوم", category: "unknown", row: 7, col: 14 },
  { number: 115, symbol: "Mc", name: "موسكوفيوم", category: "unknown", row: 7, col: 15 },
  { number: 116, symbol: "Lv", name: "ليفرموريوم", category: "unknown", row: 7, col: 16 },
  { number: 117, symbol: "Ts", name: "تينيسين", category: "halogen", row: 7, col: 17 },
  { number: 118, symbol: "Og", name: "أوغانيسون", category: "noble-gas", row: 7, col: 18 },

  { number: 57, symbol: "La", name: "لانثانوم", category: "lanthanide", row: 9, col: 3 },
  { number: 58, symbol: "Ce", name: "سيريوم", category: "lanthanide", row: 9, col: 4 },
  { number: 59, symbol: "Pr", name: "براسيوديميوم", category: "lanthanide", row: 9, col: 5 },
  { number: 60, symbol: "Nd", name: "نيوديميوم", category: "lanthanide", row: 9, col: 6 },
  { number: 61, symbol: "Pm", name: "بروميثيوم", category: "lanthanide", row: 9, col: 7 },
  { number: 62, symbol: "Sm", name: "ساماريوم", category: "lanthanide", row: 9, col: 8 },
  { number: 63, symbol: "Eu", name: "يوروبيوم", category: "lanthanide", row: 9, col: 9 },
  { number: 64, symbol: "Gd", name: "جادولينيوم", category: "lanthanide", row: 9, col: 10 },
  { number: 65, symbol: "Tb", name: "تيربيوم", category: "lanthanide", row: 9, col: 11 },
  { number: 66, symbol: "Dy", name: "ديسبروسيوم", category: "lanthanide", row: 9, col: 12 },
  { number: 67, symbol: "Ho", name: "هولميوم", category: "lanthanide", row: 9, col: 13 },
  { number: 68, symbol: "Er", name: "إربيوم", category: "lanthanide", row: 9, col: 14 },
  { number: 69, symbol: "Tm", name: "ثوليوم", category: "lanthanide", row: 9, col: 15 },
  { number: 70, symbol: "Yb", name: "إيتيربيوم", category: "lanthanide", row: 9, col: 16 },
  { number: 71, symbol: "Lu", name: "لوتيتيوم", category: "lanthanide", row: 9, col: 17 },

  { number: 89, symbol: "Ac", name: "أكتينيوم", category: "actinide", row: 10, col: 3 },
  { number: 90, symbol: "Th", name: "ثوريوم", category: "actinide", row: 10, col: 4 },
  { number: 91, symbol: "Pa", name: "بروتكتينيوم", category: "actinide", row: 10, col: 5 },
  { number: 92, symbol: "U", name: "يورانيوم", category: "actinide", row: 10, col: 6 },
  { number: 93, symbol: "Np", name: "نبتونيوم", category: "actinide", row: 10, col: 7 },
  { number: 94, symbol: "Pu", name: "بلوتونيوم", category: "actinide", row: 10, col: 8 },
  { number: 95, symbol: "Am", name: "أمريسيوم", category: "actinide", row: 10, col: 9 },
  { number: 96, symbol: "Cm", name: "كوريوم", category: "actinide", row: 10, col: 10 },
  { number: 97, symbol: "Bk", name: "بيركليوم", category: "actinide", row: 10, col: 11 },
  { number: 98, symbol: "Cf", name: "كاليفورنيوم", category: "actinide", row: 10, col: 12 },
  { number: 99, symbol: "Es", name: "آينشتاينيوم", category: "actinide", row: 10, col: 13 },
  { number: 100, symbol: "Fm", name: "فرميوم", category: "actinide", row: 10, col: 14 },
  { number: 101, symbol: "Md", name: "مندليفيوم", category: "actinide", row: 10, col: 15 },
  { number: 102, symbol: "No", name: "نوبليوم", category: "actinide", row: 10, col: 16 },
  { number: 103, symbol: "Lr", name: "لورنسيوم", category: "actinide", row: 10, col: 17 },
];

const PLACEHOLDERS = [
  { row: 6, col: 3, label: "57-71", sub: "La-Lu" },
  { row: 7, col: 3, label: "89-103", sub: "Ac-Lr" },
];

export default function ChemistryLabPage() {
  const [filter, setFilter] = useState<Category | "all">("all");
  const [selected, setSelected] = useState<Elem | null>(null);

  return (
    <StudentLayout>
      <div dir="rtl" className="p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">

        {/* Header - نفس هوية الداشبورد */}
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-7 flex items-center justify-between gap-4 bg-[#5800a9] dark:bg-[#b600d7]">
          <div className="relative z-10 text-right">
            <h1 className="text-lg xs:text-xl sm:text-2xl md:text-3xl font-black text-white mb-1 sm:mb-1.5">
              معمل الكيميائي
            </h1>
            <p className="text-white text-[11px] xs:text-xs sm:text-sm">
              الجدول الدوري التفاعلي لكل العناصر الكيميائية
            </p>
          </div>
          <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="text-white" size={22} />
          </div>
        </div>

        {/* Legend + Filter */}
        <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => (
                <span
                  key={cat}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border border-gray-100 dark:border-[#2A2A2A]"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_INFO[cat].bg }} />
                  {CATEGORY_INFO[cat].label}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as Category | "all")}
                className="text-xs sm:text-sm font-bold px-3 py-2 rounded-xl border border-gray-200 dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5800a9]/30"
              >
                <option value="all">الفئة</option>
                {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => (
                  <option key={cat} value={cat}>{CATEGORY_INFO[cat].label}</option>
                ))}
              </select>
              <button
                onClick={() => setFilter("all")}
                className="text-xs sm:text-sm font-bold px-3 py-2 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#232323] transition-colors"
              >
                إعادة تعيين
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-x-auto pb-2">
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: "repeat(18, minmax(46px, 1fr))", minWidth: 1100 }}
            >
              {ELEMENTS.map((el) => {
                const dimmed = filter !== "all" && el.category !== filter;
                return (
                  <button
                    key={el.number}
                    onClick={() => setSelected(el)}
                    style={{ gridRow: el.row, gridColumn: el.col, backgroundColor: CATEGORY_INFO[el.category].bg }}
                    className={`relative rounded-lg p-1.5 text-center transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      dimmed ? "opacity-25" : "opacity-100"
                    }`}
                  >
                    <span className="absolute top-1 right-1.5 text-[9px] font-bold text-gray-700">{el.number}</span>
                    <p className="text-sm sm:text-base font-black text-gray-900 mt-2">{el.symbol}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-gray-700 truncate">{el.name}</p>
                  </button>
                );
              })}

              {PLACEHOLDERS.map((p) => (
                <div
                  key={p.label}
                  style={{ gridRow: p.row, gridColumn: p.col }}
                  className="rounded-lg p-1.5 text-center bg-gray-100 dark:bg-[#1A1A1A] flex flex-col items-center justify-center"
                >
                  <p className="text-[9px] font-bold text-gray-500">{p.label}</p>
                  <p className="text-[10px] font-black text-gray-600">{p.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* تفاصيل العنصر المختار */}
        {selected && (
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-5 sm:p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                style={{ backgroundColor: CATEGORY_INFO[selected.category].bg }}
              >
                <span className="text-[10px] font-bold text-gray-700">{selected.number}</span>
                <span className="text-xl sm:text-2xl font-black text-gray-900">{selected.symbol}</span>
              </div>
              <div className="text-right">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">{selected.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-bold mt-1">
                  {CATEGORY_INFO[selected.category].label} · العدد الذري {selected.number}
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#232323] flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
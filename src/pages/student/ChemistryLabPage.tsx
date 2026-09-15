import { useState } from "react";
import { FlaskConical, X, GraduationCap, Settings, Scale, Calculator, Droplets, Atom, Plus, RotateCcw, Pencil, Lightbulb, ArrowLeft } from "lucide-react";
import StudentLayout from "../../components/layout/student-dashboard/StudentLayout";

// ============================================================
// الجدول الدوري - البيانات
// ============================================================
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

// ============================================================
// الأيونات - البيانات
// ============================================================
interface IonPart { text: string; sup?: boolean; sub?: boolean; }
interface Ion { parts: IonPart[]; name: string; colorGroup: "red" | "orange" | "yellow" | "blue" | "green" | "gray"; }

const ION_COLORS: Record<Ion["colorGroup"], string> = {
  red: "#f9c9d3",
  orange: "#fbd9a5",
  yellow: "#f5eca0",
  blue: "#bcd9f5",
  green: "#c8e6b0",
  gray: "#f3f4f6",
};

const monoatomicIons: Ion[] = [
  { parts: [{ text: "H" }, { text: "+", sup: true }], name: "هيدروجين", colorGroup: "red" },
  { parts: [{ text: "Li" }, { text: "+", sup: true }], name: "ليثيوم", colorGroup: "red" },
  { parts: [{ text: "Na" }, { text: "+", sup: true }], name: "صوديوم", colorGroup: "red" },
  { parts: [{ text: "K" }, { text: "+", sup: true }], name: "بوتاسيوم", colorGroup: "red" },
  { parts: [{ text: "Ag" }, { text: "+", sup: true }], name: "فضة", colorGroup: "orange" },
  { parts: [{ text: "Mg" }, { text: "2+", sup: true }], name: "المغنسيوم", colorGroup: "orange" },
  { parts: [{ text: "Ca" }, { text: "2+", sup: true }], name: "كالسيوم", colorGroup: "orange" },
  { parts: [{ text: "Ba" }, { text: "2+", sup: true }], name: "باريوم", colorGroup: "orange" },
  { parts: [{ text: "Zn" }, { text: "2+", sup: true }], name: "الزنك", colorGroup: "orange" },
  { parts: [{ text: "Al" }, { text: "3+", sup: true }], name: "ألومنيوم", colorGroup: "blue" },
  { parts: [{ text: "F" }, { text: "-", sup: true }], name: "فلوريد", colorGroup: "yellow" },
  { parts: [{ text: "Cl" }, { text: "-", sup: true }], name: "كلوريد", colorGroup: "yellow" },
  { parts: [{ text: "Br" }, { text: "-", sup: true }], name: "بروميد", colorGroup: "yellow" },
  { parts: [{ text: "I" }, { text: "-", sup: true }], name: "يوديد", colorGroup: "yellow" },
  { parts: [{ text: "O" }, { text: "2-", sup: true }], name: "أكسيد", colorGroup: "green" },
  { parts: [{ text: "S" }, { text: "2-", sup: true }], name: "كبرتيد", colorGroup: "green" },
  { parts: [{ text: "N" }, { text: "3-", sup: true }], name: "نيتريد", colorGroup: "green" },
  { parts: [{ text: "P" }, { text: "3-", sup: true }], name: "فوسفيد", colorGroup: "green" },
];

const polyatomicBasicIons: Ion[] = [
  { parts: [{ text: "CO" }, { text: "3", sub: true }, { text: "2-", sup: true }], name: "كربونات", colorGroup: "gray" },
  { parts: [{ text: "C" }, { text: "2", sub: true }, { text: "O" }, { text: "4", sub: true }, { text: "2-", sup: true }], name: "أوكسالات", colorGroup: "gray" },
  { parts: [{ text: "NO" }, { text: "3", sub: true }, { text: "-", sup: true }], name: "نترات", colorGroup: "gray" },
  { parts: [{ text: "NO" }, { text: "2", sub: true }, { text: "-", sup: true }], name: "نتريت", colorGroup: "gray" },
  { parts: [{ text: "SO" }, { text: "4", sub: true }, { text: "2-", sup: true }], name: "كبريتات", colorGroup: "gray" },
  { parts: [{ text: "SO" }, { text: "3", sub: true }, { text: "2-", sup: true }], name: "كبريتيت", colorGroup: "gray" },
  { parts: [{ text: "PO" }, { text: "4", sub: true }, { text: "3-", sup: true }], name: "فوسفات", colorGroup: "gray" },
  { parts: [{ text: "ClO" }, { text: "3", sub: true }, { text: "-", sup: true }], name: "كلورات", colorGroup: "yellow" },
  { parts: [{ text: "ClO" }, { text: "-", sup: true }], name: "هيبوكلوريت", colorGroup: "yellow" },
  { parts: [{ text: "ClO" }, { text: "4", sub: true }, { text: "-", sup: true }], name: "بيركلورات", colorGroup: "yellow" },
];

const transitionIons: Ion[] = [
  { parts: [{ text: "Cu" }, { text: "+", sup: true }], name: "نحاس (I)", colorGroup: "orange" },
  { parts: [{ text: "Cu" }, { text: "2+", sup: true }], name: "نحاس (II)", colorGroup: "orange" },
  { parts: [{ text: "Fe" }, { text: "2+", sup: true }], name: "حديد (II)", colorGroup: "orange" },
  { parts: [{ text: "Fe" }, { text: "3+", sup: true }], name: "حديد (III)", colorGroup: "orange" },
  { parts: [{ text: "Pb" }, { text: "2+", sup: true }], name: "رصاص (II)", colorGroup: "blue" },
  { parts: [{ text: "MnO" }, { text: "4", sub: true }, { text: "-", sup: true }], name: "برمنجنات", colorGroup: "orange" },
  { parts: [{ text: "CrO" }, { text: "4", sub: true }, { text: "2-", sup: true }], name: "كرومات", colorGroup: "orange" },
  { parts: [{ text: "Cr" }, { text: "2", sub: true }, { text: "O" }, { text: "7", sub: true }, { text: "2-", sup: true }], name: "ثنائي الكرومات", colorGroup: "orange" },
];

const specialOrganicIons: Ion[] = [
  { parts: [{ text: "NH" }, { text: "4", sub: true }, { text: "+", sup: true }], name: "أمونيوم", colorGroup: "gray" },
  { parts: [{ text: "OH" }, { text: "-", sup: true }], name: "هيدروكسيد", colorGroup: "gray" },
  { parts: [{ text: "HCO" }, { text: "3", sub: true }, { text: "-", sup: true }], name: "بيكربونات", colorGroup: "gray" },
  { parts: [{ text: "HSO" }, { text: "4", sub: true }, { text: "-", sup: true }], name: "بيسلفات", colorGroup: "gray" },
  { parts: [{ text: "H" }, { text: "2", sub: true }, { text: "PO" }, { text: "4", sub: true }, { text: "-", sup: true }], name: "ثنائي هيدروجين فوسفات", colorGroup: "gray" },
  { parts: [{ text: "CH" }, { text: "3", sub: true }, { text: "COO" }, { text: "-", sup: true }], name: "أسيتات", colorGroup: "gray" },
  { parts: [{ text: "CN" }, { text: "-", sup: true }], name: "سياناید", colorGroup: "gray" },
];

function IonCard({ ion }: { ion: Ion }) {
  return (
    <div
      className="rounded-xl px-3 py-3 flex flex-col items-center justify-center min-w-[90px] border border-black/5"
      style={{ backgroundColor: ION_COLORS[ion.colorGroup] }}
    >
      <p className="text-lg sm:text-xl font-black text-gray-900 flex items-start" dir="ltr">
        {ion.parts.map((p, i) => (
          <span key={i} className={p.sup ? "text-[10px] -translate-y-1" : p.sub ? "text-[10px] translate-y-1.5" : ""}>
            {p.text}
          </span>
        ))}
      </p>
      <p className="text-[10px] sm:text-[11px] font-bold text-gray-700 mt-1 text-center">{ion.name}</p>
    </div>
  );
}

// ============================================================
// التابس
// ============================================================
type Tab = "table" | "ions" | "tools" | "learn" | "settings";

const TABS: { id: Tab; label: string; icon: React.ReactNode; ready: boolean }[] = [
  { id: "table", label: "الجدول", icon: null, ready: true },
  { id: "ions", label: "الأيونات", icon: null, ready: true },
  { id: "tools", label: "الأدوات", icon: null, ready: false },
  { id: "learn", label: "ساحة التعلّم", icon: <GraduationCap size={14} />, ready: false },
  { id: "settings", label: "الإعدادات", icon: <Settings size={14} />, ready: false },
];

interface ToolItem {
  id: string;
  number: number;
  title: string;
  desc: string;
  icon: React.ReactNode;
  iconBg: string;
  ready: boolean;
}

const TOOLS: ToolItem[] = [
  {
    id: "balancer",
    number: 1,
    title: "موازن المعادلات",
    desc: "وازن المعادلات الكيميائية المعقدة تلقائياً مع الحصول على تغذية مرتدة راجعة للحسابات الكيميائية (Stoichiometry).",
    icon: <Scale size={20} className="text-red-500" />,
    iconBg: "bg-red-50",
    ready: false,
  },
  {
    id: "molar-mass",
    number: 2,
    title: "الكتلة المولية",
    desc: "احسب الأوزان الجزيئية فوراً مع تفصيل دقيق لكتلة كل عنصر على حدة.",
    icon: <Calculator size={20} className="text-amber-500" />,
    iconBg: "bg-amber-50",
    ready: false,
  },
  {
    id: "solubility",
    number: 3,
    title: "جدول الذوبانية",
    desc: "استعرض بسرعة المخططات التفاعلية وقواعد ذوبانية المركبات الأيونية.",
    icon: <Droplets size={20} className="text-emerald-500" />,
    iconBg: "bg-emerald-50",
    ready: false,
  },
  {
    id: "virtual-lab",
    number: 4,
    title: "المختبر الافتراضي",
    desc: "قم بإمالة الكأس وتفاعل مع جزيئات الماء داخل مشهد مختبر بسيط.",
    icon: <FlaskConical size={20} className="text-[#5800a9] dark:text-[#b600d7]" />,
    iconBg: "bg-[#F6EEFF] dark:bg-[#2B103D]",
    ready: false,
  },
  {
    id: "spdf",
    number: 5,
    title: "أطلس مدارات SPDF",
    desc: "استكشف جميع أشكال المدارات الذرية الـ16 باستخدام نماذج ثلاثية الأبعاد تفاعلية لكثافة الاحتمال.",
    icon: <Atom size={20} className="text-violet-500" />,
    iconBg: "bg-violet-50",
    ready: false,
  },
];

const MAX_WATER = 100;

export default function ChemistryLabPage() {
  const [activeTab, setActiveTab] = useState<Tab>("table");
  const [filter, setFilter] = useState<Category | "all">("all");
  const [hoverFilter, setHoverFilter] = useState<Category | null>(null);
  const [selected, setSelected] = useState<Elem | null>(null);

  // ── المختبر الافتراضي ──
  const [labOpen, setLabOpen] = useState(false);
  const [waterLevel, setWaterLevel] = useState(0);
  const [heaterOn, setHeaterOn] = useState(false);
  const [temp, setTemp] = useState(20);
  const [labElement, setLabElement] = useState("Na");

  const handleAddWater = () => {
    setWaterLevel((prev) => Math.min(MAX_WATER, prev + 20));
  };

  const handleResetLab = () => {
    setWaterLevel(0);
    setHeaterOn(false);
    setTemp(20);
  };

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

        {/* شريط التابس */}
        <div className="bg-gray-100 dark:bg-[#1A1A1A] rounded-2xl p-1.5 inline-flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-white dark:bg-[#111111] text-[#5800a9] dark:text-[#b600d7] shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── تاب الجدول ── */}
        {activeTab === "table" && (
          <div className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4 sm:p-5">
            <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-2xl p-3 sm:p-4 mb-4 inline-flex flex-wrap gap-2">
              {(Object.keys(CATEGORY_INFO) as Category[]).map((cat) => {
                const active = (hoverFilter ?? filter) === cat;
                return (
                  <button
                    key={cat}
                    onMouseEnter={() => setHoverFilter(cat)}
                    onMouseLeave={() => setHoverFilter(null)}
                    onClick={() => setFilter((prev) => (prev === cat ? "all" : cat))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold border transition-all duration-150 ${
                      active
                        ? "border-[#5800a9] dark:border-[#b600d7] bg-white dark:bg-[#111111] shadow-sm"
                        : "border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#111111] hover:border-gray-300 dark:hover:border-gray-500"
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_INFO[cat].bg }} />
                    {CATEGORY_INFO[cat].label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-x-auto pb-2">
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: "repeat(18, minmax(46px, 1fr))", minWidth: 1100 }}
              >
                {ELEMENTS.map((el) => {
                  const activeCat = hoverFilter ?? filter;
                  const dimmed = activeCat !== "all" && el.category !== activeCat;
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

            {selected && (
              <div className="mt-5 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: CATEGORY_INFO[selected.category].bg }}
                  >
                    <span className="text-[10px] font-bold text-gray-700">{selected.number}</span>
                    <span className="text-xl font-black text-gray-900">{selected.symbol}</span>
                  </div>
                  <div className="text-right">
                    <h3 className="text-lg font-black text-gray-900 dark:text-white">{selected.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-1">
                      {CATEGORY_INFO[selected.category].label} · العدد الذري {selected.number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl bg-white dark:bg-[#111111] text-gray-500 hover:bg-gray-100 flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── تاب الأيونات ── */}
        {activeTab === "ions" && (
          <div className="space-y-8">

            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">أحادي الذرة أساسي</h2>
              <div className="flex flex-wrap gap-2.5">
                {monoatomicIons.map((ion, i) => <IonCard key={i} ion={ion} />)}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">متعدد الذرات أساسي</h2>
              <div className="flex flex-wrap gap-2.5">
                {polyatomicBasicIons.map((ion, i) => <IonCard key={i} ion={ion} />)}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">الفلزات الانتقالية</h2>
              <div className="flex flex-wrap gap-2.5">
                {transitionIons.map((ion, i) => <IonCard key={i} ion={ion} />)}
              </div>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-3">خاص وعضوي</h2>
              <div className="flex flex-wrap gap-2.5">
                {specialOrganicIons.map((ion, i) => <IonCard key={i} ion={ion} />)}
              </div>
            </div>

          </div>
        )}

        {/* ── تاب الأدوات ── */}
        {activeTab === "tools" && (
          <div>
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-1.5">أدوات الكيمياء</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">أدوات ومختبرات الكيمياء للصفوف 9-12</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => tool.ready && setLabOpen(true)}
                  className={`text-right rounded-2xl border p-5 sm:p-6 transition-all duration-200 ${
                    tool.ready
                      ? "border-[#5800a9]/30 dark:border-[#b600d7]/40 bg-white dark:bg-[#111111] hover:shadow-lg cursor-pointer"
                      : "border-gray-100 dark:border-[#2A2A2A] bg-gray-50/60 dark:bg-[#151515] cursor-not-allowed opacity-80"
                  }`}
                >
                  <div className="flex items-start justify-between mb-6 sm:mb-8">
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center ${tool.iconBg}`}>
                      {tool.icon}
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] text-[9px] font-black text-gray-500 flex items-center justify-center">
                        {tool.number}
                      </span>
                    </div>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tool.ready ? "bg-[#5800a9] dark:bg-[#b600d7] text-white" : "bg-gray-100 dark:bg-[#1A1A1A] text-gray-400"
                      }`}
                    >
                      <ArrowLeft size={14} />
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white mb-2">{tool.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 leading-6">{tool.desc}</p>

                  {!tool.ready && (
                    <span className="inline-block mt-4 px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-100 dark:bg-[#1A1A1A] text-gray-400">
                      قريبًا
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── تابات لسه هتتعمل ── */}
        {(activeTab === "learn" || activeTab === "settings") && (
          <div className="flex flex-col items-center justify-center text-center py-20 sm:py-28 px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center mb-4 sm:mb-5">
              <FlaskConical className="text-[#5800a9] dark:text-[#b600d7]" size={32} />
            </div>
            <span className="inline-block mb-3 px-3.5 py-1.5 rounded-full text-xs font-black bg-[#F6EEFF] dark:bg-[#2B103D] text-[#5800a9] dark:text-[#b600d7]">
              قريبًا
            </span>
            <h2 className="text-lg sm:text-xl font-black text-gray-800 dark:text-gray-200">الميزة دي هتتاح قريبًا</h2>
          </div>
        )}

        {/* ── مودال المختبر الافتراضي ── */}
        {labOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-[#111111] rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden">

              {/* Modal header */}
              <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 dark:border-[#2A2A2A]">
                <h3 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">المختبر الافتراضي</h3>
                <button
                  onClick={() => setLabOpen(false)}
                  className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-500 hover:bg-gray-200 dark:hover:bg-[#232323] flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Lab scene */}
              <div className="relative px-5 sm:px-7 py-8 sm:py-10 min-h-[340px] flex flex-col items-center justify-end bg-gradient-to-b from-gray-50 to-white dark:from-[#151515] dark:to-[#0d0d0d]">

                {/* Hint bubble */}
                <div className="absolute top-4 left-4 sm:left-7 flex items-center gap-2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl px-3 py-2 shadow-sm">
                  <Lightbulb size={14} className="text-amber-400" />
                  <span className="text-[11px] sm:text-xs font-bold text-gray-500 dark:text-gray-400">
                    استخدم زرار "إضافة ماء" عشان تملأ الكأس
                  </span>
                </div>

                {/* Temp gauge */}
                <div className="absolute right-4 sm:right-7 top-1/3 -translate-y-1/2 bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl w-16 sm:w-20 py-3 flex flex-col items-center gap-2 shadow-sm">
                  <div className="w-2 h-16 sm:h-20 rounded-full bg-gray-100 dark:bg-[#232323] relative overflow-hidden">
                    <div
                      className="absolute bottom-0 w-full bg-blue-400 rounded-full transition-all duration-500"
                      style={{ height: `${Math.min(100, ((temp - 0) / 100) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs sm:text-sm font-black text-gray-800 dark:text-gray-200">{temp}°</p>
                  <p className="text-[9px] font-bold text-gray-400">TEMP</p>
                </div>

                {/* Beaker */}
                <div className="relative w-24 sm:w-28 h-40 sm:h-48 border-2 border-gray-200 dark:border-[#2A2A2A] border-t-0 rounded-b-2xl overflow-hidden bg-white/40 dark:bg-white/5 mb-4">
                  <div
                    className="absolute bottom-0 left-0 w-full bg-blue-300/80 transition-all duration-500"
                    style={{ height: `${waterLevel}%` }}
                  />
                  {/* stand */}
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1.5 h-8 bg-gray-700 dark:bg-gray-400" />
                </div>
                <div className="w-20 h-2 bg-gray-700 dark:bg-gray-500 rounded-full mb-8" />

                {/* Selected element chip */}
                <div className="absolute bottom-8 left-4 sm:left-10 w-14 h-14 rounded-xl bg-red-100 border border-red-200 flex flex-col items-center justify-center shadow-sm">
                  <span className="text-sm font-black text-red-600">{labElement}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-3 px-5 sm:px-7 py-4 sm:py-5 border-t border-gray-100 dark:border-[#2A2A2A]">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl px-3 py-2">
                  <button
                    onClick={() => setHeaterOn((prev) => !prev)}
                    className={`text-[11px] font-black px-2 py-1 rounded-lg ${
                      heaterOn ? "bg-red-500 text-white" : "bg-white dark:bg-[#232323] text-gray-400"
                    }`}
                  >
                    {heaterOn ? "ON" : "OFF"}
                  </button>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">سخان</span>
                </div>

                <button
                  onClick={handleAddWater}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs sm:text-sm font-bold hover:opacity-90 transition-all"
                >
                  <Plus size={14} />
                  إضافة ماء
                </button>

                <button
                  onClick={handleResetLab}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#232323] transition-all"
                >
                  <RotateCcw size={14} />
                  إعادة تعيين
                </button>

                <button
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-300 text-xs sm:text-sm font-bold hover:bg-gray-200 dark:hover:bg-[#232323] transition-all"
                >
                  <Pencil size={14} />
                  عنصر
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
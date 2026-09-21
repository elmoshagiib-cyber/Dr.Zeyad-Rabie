export type CourseCategory = {
  value: string;        // القيمة اللي بتتحفظ في الداتابيز
  label: string;        // الاسم في الاختيار وعلى بادج الكارت
  sectionTitle: string; // عنوان القسم في صفحة الصف عند الطلاب
  accent: string;       // لون الشريط جنب عنوان القسم
};

export const COURSE_CATEGORIES: CourseCategory[] = [
  // القديمة (متغيرش قيمها عشان الكورسات الموجودة)
  { value: "term1", label: "الشهور", sectionTitle: "كورسات الشهور", accent: "bg-purple-500" },
  { value: "term2", label: "الفصول", sectionTitle: "كورسات الفصول", accent: "bg-blue-500" },
  { value: "revision", label: "مراجعة", sectionTitle: "كورسات المراجعة", accent: "bg-amber-500" },
  { value: "free", label: "مجاني", sectionTitle: "الكورسات المجانية", accent: "bg-green-500" },

  // الجديدة
  { value: "annual", label: "الاشتراك السنوي", sectionTitle: "الاشتراك السنوي", accent: "bg-blue-500" },
  { value: "per_term", label: "الاشتراك بالترم", sectionTitle: "الاشتراك بالترم", accent: "bg-blue-500" },
  { value: "course_workshop", label: "الاشتراك بالكورس + الورشة", sectionTitle: "الاشتراك بالكورس + الورشة", accent: "bg-blue-500" },
  { value: "per_lecture", label: "الاشتراك بالمحاضرة (الحصة بـ٦٠ جنيه)", sectionTitle: "الاشتراك بالمحاضرة", accent: "bg-blue-500" },
  { value: "foundation_2027", label: "الكورس التأسيسي 2027", sectionTitle: "الكورس التأسيسي 2027", accent: "bg-green-500" },
  { value: "workshops", label: "الورش منفصلة", sectionTitle: "الورش المنفصلة", accent: "bg-amber-500" },
];

export const getCategoryLabel = (value?: string | null) =>
  COURSE_CATEGORIES.find((c) => c.value === value)?.label ?? "";
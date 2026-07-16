import { useState } from "react";
import InstructorLayout from "../../layouts/InstructorLayout";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import {
  BookOpen,
  DollarSign,
  GraduationCap,
  ImagePlus,
  Layers,
  Loader2,
  Sparkles,
} from "lucide-react";

export function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const navigate = useNavigate();
  const { user } = useApp();
  const [loading, setLoading] = useState(false);

  const createCourse = async () => {
    try {
      setLoading(true);

      if (!title || !description || !grade) {
        alert("اكمل جميع البيانات");
        return;
      }

      let thumbnailUrl = "";
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log("SESSION =", session);

      if (thumbnail) {
        const ext = thumbnail.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, thumbnail);

        if (uploadError) throw uploadError;

        thumbnailUrl = supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(fileName).data.publicUrl;
      }

      const slug = `${title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")}-${Date.now()}`;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("المستخدم غير مسجل دخول");

      const { data: instructor, error: instructorError } = await supabase
        .from("instructors")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (instructorError) throw instructorError;

      const { data, error } = await supabase
        .from("courses")
        .insert({
          teacher_id: instructor.id,
          title,
          slug,
          description,
          grade,
          price: Number(price || 0),
          thumbnail: thumbnailUrl,
          is_free: Number(price) === 0,
          is_published: false,
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/instructor/courses/edit/${data.id}`);
    } catch (err) {
      console.error(err);
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const grades = [
    { value: "first_sec", label: "الصف الأول الثانوي" },
    { value: "second_sec", label: "الصف الثاني الثانوي" },
    { value: "third_sec", label: "الصف الثالث الثانوي" },
    { value: "first_prep", label: "الصف الأول الإعدادي" },
    { value: "second_prep", label: "الصف الثاني الإعدادي" },
    { value: "third_prep", label: "الصف الثالث الإعدادي" },
  ];

  const selectedGradeLabel =
    grades.find((g) => g.value === grade)?.label || "";

  return (
    <InstructorLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">

        {/* ── Header ── */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-100 flex items-center justify-center">
              <Sparkles size={20} className="text-violet-600" />
            </div>
            <span className="text-sm font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
              كورس جديد
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900">
            إنشاء كورس جديد
          </h1>
          <p className="mt-2 text-slate-500 text-base sm:text-lg">
            قم بإدخال بيانات الكورس الأساسية ثم انشره ليظهر داخل المنصة.
          </p>
        </div>

        {/* ── Grid ── */}
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ── Left: Form ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* اسم الكورس */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                  <BookOpen size={15} className="text-violet-600" />
                </div>
                <label className="font-black text-slate-800">
                  اسم الكورس
                </label>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="
                  w-full h-12 sm:h-13
                  border border-slate-200
                  rounded-xl
                  px-4
                  text-slate-800
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:border-violet-400
                  focus:ring-2
                  focus:ring-violet-100
                  transition
                  text-sm sm:text-base
                "
                placeholder="مثال : شرح الباب الأول في الفيزياء"
              />
            </div>

            {/* الوصف */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Layers size={15} className="text-blue-600" />
                </div>
                <label className="font-black text-slate-800">
                  وصف الكورس
                </label>
              </div>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="
                  w-full
                  border border-slate-200
                  rounded-xl
                  p-4
                  resize-none
                  text-slate-800
                  placeholder:text-slate-400
                  focus:outline-none
                  focus:border-violet-400
                  focus:ring-2
                  focus:ring-violet-100
                  transition
                  text-sm sm:text-base
                "
                placeholder="اكتب وصفاً شاملاً للكورس يوضح ما سيتعلمه الطالب..."
              />
            </div>

            {/* الصف + السعر */}
            <div className="grid sm:grid-cols-2 gap-5">

              {/* الصف الدراسي */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                    <GraduationCap size={15} className="text-green-600" />
                  </div>
                  <label className="font-black text-slate-800">
                    الصف الدراسي
                  </label>
                </div>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="
                    w-full h-12
                    border border-slate-200
                    rounded-xl
                    px-4
                    text-slate-800
                    focus:outline-none
                    focus:border-violet-400
                    focus:ring-2
                    focus:ring-violet-100
                    transition
                    text-sm sm:text-base
                    bg-white
                    appearance-none
                    cursor-pointer
                  "
                >
                  <option value="">اختر الصف الدراسي</option>
                  {grades.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* السعر */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                    <DollarSign size={15} className="text-amber-600" />
                  </div>
                  <label className="font-black text-slate-800">
                    سعر الكورس
                  </label>
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  disabled={price === "0"}
                  className="
                    w-full h-12
                    border border-slate-200
                    rounded-xl
                    px-4
                    text-slate-800
                    placeholder:text-slate-400
                    focus:outline-none
                    focus:border-violet-400
                    focus:ring-2
                    focus:ring-violet-100
                    transition
                    text-sm sm:text-base
                    disabled:bg-slate-50
                    disabled:text-slate-400
                  "
                  placeholder="0"
                  min={0}
                />
                {/* مجاني toggle */}
                <label className="mt-3 flex items-center gap-2 cursor-pointer group w-fit">
                  <div
                    onClick={() =>
                      price === "0" ? setPrice("") : setPrice("0")
                    }
                    className={`
                      w-11 h-6 rounded-full transition-colors duration-300 flex items-center px-0.5
                      ${price === "0" ? "bg-violet-600" : "bg-slate-200"}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 bg-white rounded-full shadow transition-transform duration-300
                        ${price === "0" ? "-translate-x-5" : "translate-x-0"}
                      `}
                    />
                  </div>
                  <span className="text-sm font-bold text-slate-600 group-hover:text-violet-700 transition">
                    الكورس مجاني
                  </span>
                </label>
              </div>

            </div>

            {/* صورة الكورس */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center">
                  <ImagePlus size={15} className="text-pink-600" />
                </div>
                <label className="font-black text-slate-800">
                  صورة الكورس
                </label>
              </div>

              <label
                className="
                  w-full
                  h-48 sm:h-64 lg:h-72
                  border-2
                  border-dashed
                  border-slate-300
                  rounded-2xl
                  bg-slate-50
                  hover:border-violet-400
                  hover:bg-violet-50
                  transition-all
                  duration-300
                  cursor-pointer
                  flex
                  flex-col
                  items-center
                  justify-center
                  overflow-hidden
                  relative
                  group
                "
              >
                {thumbnail ? (
                  <>
                    <img
                      src={URL.createObjectURL(thumbnail)}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div
                      className="
                        absolute inset-0
                        bg-black/50
                        opacity-0
                        group-hover:opacity-100
                        transition
                        flex items-center justify-center
                      "
                    >
                      <div className="text-white text-center">
                        <ImagePlus size={32} className="mx-auto mb-2" />
                        <span className="font-bold text-sm sm:text-base">
                          اضغط لتغيير الصورة
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center px-4">
                    <div className="
                      w-16 h-16 sm:w-20 sm:h-20
                      rounded-2xl
                      bg-violet-100
                      flex items-center justify-center
                      mx-auto mb-4
                      group-hover:scale-110
                      transition-transform
                      duration-300
                    ">
                      <ImagePlus size={28} className="text-violet-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-slate-700">
                      ارفع صورة الكورس
                    </h3>
                    <p className="mt-1 text-slate-500 text-sm">
                      اضغط هنا لاختيار صورة من جهازك
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      {["PNG", "JPG", "WEBP"].map((fmt) => (
                        <span
                          key={fmt}
                          className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setThumbnail(e.target.files?.[0] || null)
                  }
                />
              </label>
            </div>

            {/* زر الإنشاء */}
            <button
              onClick={createCourse}
              disabled={loading}
              className="
                w-full h-14 sm:h-16
                rounded-2xl
                bg-violet-600
                hover:bg-violet-700
                active:scale-[0.98]
                disabled:opacity-60
                disabled:cursor-not-allowed
                text-white
                font-black
                text-base sm:text-lg
                transition-all
                duration-200
                shadow-lg shadow-violet-200
                flex items-center justify-center gap-3
              "
            >
              {loading ? (
                <>
                  <Loader2 size={22} className="animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>إنشاء الكورس</span>
                </>
              )}
            </button>
          </div>

          {/* ── Right: Preview ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 sticky top-6">

              <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                معاينة الكورس
              </h2>

              {/* صورة المعاينة */}
              <div className="h-40 sm:h-48 rounded-2xl overflow-hidden bg-slate-100">
                {thumbnail ? (
                  <img
                    src={URL.createObjectURL(thumbnail)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImagePlus size={28} />
                    <span className="text-sm">لا توجد صورة</span>
                  </div>
                )}
              </div>

              {/* بيانات المعاينة */}
              <div className="mt-4 space-y-3">

                {selectedGradeLabel && (
                  <span className="inline-block text-xs font-bold text-violet-700 bg-violet-50 px-3 py-1 rounded-full">
                    {selectedGradeLabel}
                  </span>
                )}

                <h3 className="text-base sm:text-xl font-black text-slate-900 leading-snug">
                  {title || (
                    <span className="text-slate-300">اسم الكورس</span>
                  )}
                </h3>

                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">
                  {description || (
                    <span className="text-slate-300">وصف الكورس</span>
                  )}
                </p>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        Number(price) === 0 && price !== ""
                          ? "bg-green-500"
                          : "bg-amber-400"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-500">
                      {Number(price) === 0 && price !== ""
                        ? "مجاني"
                        : "مدفوع"}
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-violet-700">
                    {price || "0"} ج.م
                  </span>
                </div>
              </div>

              {/* تلميح */}
              <div className="mt-5 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs text-amber-700 font-bold text-center leading-relaxed">
                  💡 بعد الإنشاء ستنتقل لصفحة تعديل الكورس لإضافة المحتوى
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </InstructorLayout>
  );
}
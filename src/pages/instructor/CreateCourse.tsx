import { useState } from "react";
import InstructorLayout from "../../layouts/InstructorLayout";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";


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

    if (
      !title ||
      !description ||
      !grade
    ) {
      alert("اكمل جميع البيانات");
      return;
    }

    let thumbnailUrl = "";
const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION =", session);

    if (thumbnail) {
      const ext =
        thumbnail.name.split(".").pop();

      const fileName =
        `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } =
        await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, thumbnail);

      if (uploadError)
        throw uploadError;

      thumbnailUrl =
        supabase.storage
          .from("course-thumbnails")
          .getPublicUrl(fileName)
          .data.publicUrl;
    }

    const slug = `${title
  .trim()
  .toLowerCase()
  .replace(/\s+/g, "-")
  .replace(/[^\w-]+/g, "")}-${Date.now()}`;
        
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  throw new Error("المستخدم غير مسجل دخول");
}

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

  return (
     <InstructorLayout>

      <div className="max-w-6xl mx-auto">

        <div className="mb-10">

  <h1 className="text-5xl font-black text-slate-900">
    إنشاء كورس جديد
  </h1>

  <p className="mt-3 text-slate-500 text-lg">
    قم بإدخال بيانات الكورس الأساسية ثم انشره ليظهر داخل المنصة.
  </p>

</div>


       <div className="grid lg:grid-cols-3 gap-8">

    <div className="lg:col-span-2">

        <div className="bg-white rounded-3xl border shadow-sm p-8 space-y-8">

          {/* اسم الكورس */}

          <div>
            <label className="block mb-2 font-bold">
              اسم الكورس
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full h-12 border rounded-xl px-4"
              placeholder="مثال : شرح الباب الأول"
            />
          </div>


          {/* الوصف */}

          <div>
            <label className="block mb-2 font-bold">
              وصف الكورس
            </label>

            <textarea
              rows={5}
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              className="w-full border rounded-xl p-4 resize-none"
            />
          </div>

          {/* الصف */}

          <div>
            <label className="block mb-2 font-bold">
              الصف الدراسي
            </label>

            <select
              value={grade}
              onChange={(e) =>
                setGrade(e.target.value)
              }
              className="w-full h-12 border rounded-xl px-4"
            >
              <option value="">
                اختر الصف
              </option>

              <option value="first_sec">
                الصف الأول الثانوي
              </option>

              <option value="second_sec">
                الصف الثاني الثانوي
              </option>

              <option value="third_sec">
                الصف الثالث الثانوي
              </option>

              <option value="first_prep">
                الصف الأول الإعدادي
              </option>

              <option value="second_prep">
                الصف الثاني الإعدادي
              </option>

              <option value="third_prep">
                الصف الثالث الإعدادي
              </option>

            </select>
          </div>

          {/* السعر */}

          <div>
            <label className="block mb-2 font-bold">
              السعر
            </label>

            <input
              type="number"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value)
              }
              className="w-full h-12 border rounded-xl px-4"
            />
          </div>

<div className="flex items-center gap-3">


  <input
    type="checkbox"
    checked={price === "0"}
    onChange={(e) => {
      if (e.target.checked) {
        setPrice("0");
      } else {
        setPrice("");
      }
    }}
  />

  <label className="font-medium">
    الكورس مجاني
  </label>

</div>

          {/* الصورة */}

          <div>
  <label className="block mb-3 font-bold">
    صورة الكورس
  </label>

  <label
    className="
      w-full
      h-[320px]
      border-2
      border-dashed
      border-slate-300
      rounded-3xl
      bg-slate-50
      hover:border-violet-500
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
    "
  >
    {thumbnail ? (
      <>
        <img
          src={URL.createObjectURL(thumbnail)}
          alt="Preview"
          className="
            absolute
            inset-0
            w-full
            h-full
            object-cover
          "
        />

        <div
          className="
            absolute
            inset-0
            bg-black/40
            opacity-0
            hover:opacity-100
            transition
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-lg
          "
        >
          اضغط لتغيير الصورة
        </div>
      </>
    ) : (
      <>
        <div className="text-6xl">
          🖼️
        </div>

        <h3 className="mt-6 text-2xl font-bold text-slate-700">
          ارفع صورة الكورس
        </h3>

        <p className="mt-2 text-slate-500">
          اضغط هنا لاختيار صورة من جهازك
        </p>

        <p className="mt-6 text-sm text-slate-400">
          PNG • JPG • WEBP
        </p>
      </>
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


          {/* الزر */}

          <button
onClick={createCourse}
disabled={loading}
            className="
            w-full
            h-14
            rounded-2xl
            bg-violet-600
            text-white
            font-bold
            text-lg
            "
          >
            نشر الكورس
          </button>
        </div>
        </div>
        <div>

  <div className="bg-white rounded-3xl border shadow-sm p-6 sticky top-8">

    <h2 className="text-2xl font-black mb-6">
      معاينة الكورس
    </h2>

    <div
      className="
      h-52
      rounded-2xl
      overflow-hidden
      bg-slate-100
      "
    >

      {thumbnail ? (

        <img
          src={URL.createObjectURL(thumbnail)}
          className="w-full h-full object-cover"
        />

      ) : (

        <div className="w-full h-full flex items-center justify-center text-slate-400">
          لا توجد صورة
        </div>

      )}

    </div>

    <h3 className="mt-6 text-2xl font-black">

      {title || "اسم الكورس"}

    </h3>

    <p className="mt-3 text-slate-500 line-clamp-3">

      {description || "وصف الكورس"}

    </p>

    <div className="mt-6 flex justify-between">

      <span className="font-bold">

        {grade || "الصف"}

      </span>

      <span className="text-violet-700 font-black">

        {price || 0} جنيه

      </span>

    </div>

  </div>

</div>

</div>

      </div>
     <div>

</div> 
     </InstructorLayout>
     
  );
}
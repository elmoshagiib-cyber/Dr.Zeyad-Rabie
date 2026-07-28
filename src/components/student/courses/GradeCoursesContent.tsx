// src/components/student/courses/GradeCoursesContent.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import { Card, CardContent } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { BookOpen, Clock, Tag } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

interface GradeCoursesContentProps {
  grade: string;
}

export default function GradeCoursesContent({ grade }: GradeCoursesContentProps) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
const [showAuthModal, setShowAuthModal] = useState(false);
const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
const [subscriptionCode, setSubscriptionCode] = useState("");
const [selectedCourse, setSelectedCourse] = useState<any>(null);
const [myCourses, setMyCourses] = useState<number[]>([]);

useEffect(() => {
  loadCourses();
  loadMyCourses();
}, [grade]);

  const loadCourses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("courses")
      .select("*")
      .eq("is_published", true)
.eq("is_hidden", false)
.eq("grade", grade)
.order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

const loadMyCourses = async () => {
  const user = localStorage.getItem("user");

  if (!user) return;

  const currentUser = JSON.parse(user);

  const now = new Date().toISOString();

const { data } = await supabase
  .from("student_courses")
  .select("course_id, expires_at")
  .eq("student_id", currentUser.id)
  .eq("active", true);

const validCourses =
  data
    ?.filter((item: any) => {
      return !item.expires_at || item.expires_at > now;
    })
    .map((item: any) => item.course_id) || [];

  setMyCourses(validCourses);
};

const handleCourseAction = (course: any) => {

  if (myCourses.includes(course.id)) {
  navigate(`/courses/${course.id}`);
  return;
}
  const user = localStorage.getItem("user");

  if (!user) {
    setShowAuthModal(true);
    return;
  }

  if (course.is_free) {
    navigate(`/courses/${course.id}`);
    return;
  }

  setSelectedCourse(course);
  setShowSubscriptionModal(true);
};

const activateSubscription = async () => {

  const { data, error } = await supabase
    .from("subscription_codes")
    .select("*")
    .eq("code", subscriptionCode)
    .single();

  if (error || !data) {
    alert("كود الاشتراك غير صحيح");
    return;
  }

  if (data.status !== "active") {
    alert("هذا الكود غير صالح أو تم استخدامه");
    return;
  }

  if (data.course_id !== selectedCourse.id) {
    alert("هذا الكود لا يخص هذا الكورس");
    return;
  }

  const currentUser = JSON.parse(localStorage.getItem("user")!);

const studentId = Number(currentUser.id);

// التحقق أولًا هل الطالب مشترك بالفعل
const { data: existingSubscription } = await supabase
  .from("student_courses")
  .select("id")
  .eq("student_id", studentId)
  .eq("course_id", selectedCourse.id)
  .eq("active", true)
  .maybeSingle();

if (existingSubscription) {
  alert("أنت مشترك بالفعل في هذا الكورس.");
  return;
}

// إضافة الاشتراك
const { error: enrollError } = await supabase
  .from("student_courses")
  .insert({
    student_id: studentId,
    course_id: selectedCourse.id,
    active: true,
    subscription_type: "كود اشتراك",
    expires_at: new Date(
      Date.now() + data.duration_days * 24 * 60 * 60 * 1000
    ).toISOString(),
  });

if (enrollError) {
  alert("حدث خطأ أثناء إضافة الاشتراك");
  return;
}

// تحديث حالة الكود
const expiresAt = new Date();
expiresAt.setDate(expiresAt.getDate() + data.duration_days);

const { error: codeError } = await supabase
  .from("subscription_codes")
  .update({
    status: "used",
    student_id: studentId,
    used_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
  })
  .eq("id", data.id);

if (codeError) {
  alert("تم الاشتراك لكن حدث خطأ أثناء تحديث الكود");
  return;
}

// تحديث الواجهة
await loadMyCourses();

setShowSubscriptionModal(false);
setSubscriptionCode("");
setSelectedCourse(null);

alert("تم تفعيل الاشتراك بنجاح ✅");
};



  const CourseCard = ({ course }: { course: any }) => (
    <Card
      hover
      className="
        group overflow-hidden rounded-2xl
        border border-slate-200 dark:border-white/10
        bg-white dark:bg-[#1E244F]
        shadow-md hover:shadow-xl
        flex flex-col
        transition-all duration-500
        hover:-translate-y-1
      "
    >
      <div className="relative overflow-hidden aspect-video w-full">
        <img
          src={
            course.thumbnail ||
            "https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=800"
          }
          alt={course.title}
          className="
            w-full h-full object-cover
            transition-transform duration-700
            group-hover:scale-105
            brightness-95 group-hover:brightness-100
          "
        />

        {course.is_free && (
          <span className="
            absolute top-3 right-3
            bg-blue-500 text-white
            text-xs sm:text-sm font-bold
            px-3 py-1 rounded-lg
            shadow
          ">
            مجاني
          </span>
        )}

        {course.category && (
          <span className="
            absolute top-3 left-3
            bg-black/50 backdrop-blur-sm text-white
            text-xs font-semibold
            px-2.5 py-1 rounded-lg
          ">
            {course.category === 'term1' && 'الترم الأول'}
            {course.category === 'term2' && 'الترم الثاني'}
            {course.category === 'revision' && 'مراجعة'}
            {course.category === 'free' && 'مجاني'}
          </span>
        )}

        <div className="
          absolute inset-0 opacity-0 group-hover:opacity-100
          transition-opacity duration-700
          bg-gradient-to-r from-transparent via-white/15 to-transparent
          -translate-x-full group-hover:translate-x-full
          transition-transform duration-1000
        " />
      </div>

      <CardContent className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
        <h3 className="
          text-base sm:text-lg font-black
          text-slate-900 dark:text-white
          line-clamp-2
          group-hover:text-[#5C1D75] dark:group-hover:text-[#F6AC08]
          transition-colors duration-300
        ">
          {course.title}
        </h3>

        <p className="
          text-sm text-slate-500 dark:text-slate-400
          line-clamp-2 flex-1
        ">
          {course.description}
        </p>

        <div className="
          flex items-center justify-between
          text-xs sm:text-sm text-slate-400 dark:text-slate-500
          border-t border-slate-100 dark:border-white/10
          pt-3
        ">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            17 أبريل 2026
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            5 مايو 2026
          </span>
        </div>

        {course.price > 0 && (
          <div className="flex items-center gap-1.5">
  <Tag className="w-4 h-4 text-purple-500" />

  <span
    className={`text-base sm:text-lg font-black ${
      course.is_free
        ? "text-emerald-600"
        : "text-purple-600 dark:text-purple-400"
    }`}
  >
    {course.is_free ? "مجاني" : `${course.price} جنيه`}
  </span>
</div>
        )}

     {course.is_free ? (
  <Button
    className="
      w-full
      text-sm sm:text-base
      py-2.5 sm:py-3
      bg-[#371143]
      hover:bg-[#4A175B]
      text-white
      transition-all duration-300
      hover:scale-[1.02]
    "
    onClick={() => navigate(`/courses/${course.id}`)}
  >
    الدخول للكورس
  </Button>
) : (
  <div className="flex gap-2 sm:gap-3 mt-1">

<Button
  onClick={() => handleCourseAction(course)}
>
  {myCourses.includes(course.id)
  ? "الدخول للكورس"
  : "اشترك الآن"}
</Button>

    <Button
      variant="outline"
      className="flex-1 text-xs sm:text-sm py-2 sm:py-2.5"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      تفاصيل
    </Button>
  </div>
)}
      </CardContent>
    </Card>
  );

  const CourseSection = ({
    title,
    icon,
    list,
    accent,
  }: {
    title: string;
    icon: React.ReactNode;
    list: any[];
    accent: string;
  }) => {
    if (list.length === 0) return null;
    return (
      <section className="mb-12 sm:mb-16">
        <div className="flex items-center gap-3 mb-5 sm:mb-7">
          <div className={`w-1 h-8 rounded-full ${accent}`} />
          <span className="text-slate-400 dark:text-slate-500">{icon}</span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white">
            {title}
          </h2>
          <span className="
            mr-auto text-xs sm:text-sm font-bold
            bg-slate-100 dark:bg-white/10
            text-slate-500 dark:text-slate-400
            px-2.5 py-1 rounded-full
          ">
            {list.length} كورس
          </span>
        </div>

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          xl:grid-cols-3
          gap-4 sm:gap-6
        ">
          {list.map(c => <CourseCard key={c.id} course={c} />)}
        </div>
      </section>
    );
  };

  const term1 = courses.filter(c => c.category === 'term1');
  const term2 = courses.filter(c => c.category === 'term2');
  const revision = courses.filter(c => c.category === 'revision');
  const free = courses.filter(c => c.category === 'free');
  const other = courses.filter(
    c => !['term1', 'term2', 'revision', 'free'].includes(c.category)
  );

  const hasSections = term1.length || term2.length || revision.length || free.length;

return (
  <>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="
              rounded-2xl overflow-hidden
              bg-white dark:bg-[#1E244F]
              border border-slate-200 dark:border-white/10
              animate-pulse
            ">
              <div className="aspect-video bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                  <div className="flex-1 h-9 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && courses.length === 0 && (
        <div className="text-center py-20 sm:py-32">
          <div className="
            w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6
            rounded-2xl bg-slate-100 dark:bg-white/10
            flex items-center justify-center
          ">
            <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
          </div>
          <h3 className="
            text-xl sm:text-3xl font-black
            text-slate-900 dark:text-white mb-3
          ">
            لا توجد كورسات متاحة حالياً
          </h3>
          <p className="text-sm sm:text-lg text-slate-500 dark:text-slate-400">
            سيتم إضافة الكورسات قريبًا...
          </p>
        </div>
      )}

      {!loading && hasSections ? (
        <>
          <CourseSection
            title="كورسات الترم الأول"
            icon={<BookOpen className="w-5 h-5" />}
            list={term1}
            accent="bg-purple-500"
          />
          <CourseSection
            title="كورسات الترم الثاني"
            icon={<BookOpen className="w-5 h-5" />}
            list={term2}
            accent="bg-blue-500"
          />
          <CourseSection
            title="كورسات المراجعة"
            icon={<BookOpen className="w-5 h-5" />}
            list={revision}
            accent="bg-amber-500"
          />
          <CourseSection
            title="الكورسات المجانية"
            icon={<BookOpen className="w-5 h-5" />}
            list={free}
            accent="bg-green-500"
          />
          {other.length > 0 && (
            <CourseSection
              title="كورسات أخرى"
              icon={<BookOpen className="w-5 h-5" />}
              list={other}
              accent="bg-slate-400"
            />
          )}
        </>
      ) : (
        !loading && courses.length > 0 && (
          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-3
            gap-4 sm:gap-6
          ">
            {courses.map(c => <CourseCard key={c.id} course={c} />)}
          </div>
        )
      )}
    </div>

   {showSubscriptionModal && (
  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">

    <div
      className="
        w-full max-w-md
        rounded-3xl
        bg-white dark:bg-[#1E244F]
        border border-slate-200 dark:border-white/10
        shadow-2xl
        p-8
      "
    >

      <div className="text-center">

        <div
          className="
            mx-auto mb-5
            w-16 h-16
            rounded-full
            bg-purple-100
            dark:bg-[#2A0F3B]
            flex items-center justify-center
            text-3xl
          "
        >
          🔐
        </div>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          تفعيل الاشتراك
        </h2>

        <p className="mt-3 text-slate-500 dark:text-slate-400 leading-7">
          أدخل كود الاشتراك الخاص بك لتفعيل الكورس.
        </p>

        <h3 className="mt-2 font-bold text-lg text-[#371143] dark:text-[#F6AC08]">
          {selectedCourse?.title}
        </h3>

      </div>

      <input
        type="text"
        value={subscriptionCode}
        onChange={(e) => setSubscriptionCode(e.target.value.toUpperCase())}
        placeholder="XXXX-XXXX"
        className="
          mt-8
          w-full
          rounded-xl
          border
          border-slate-300
          dark:border-white/10
          bg-transparent
          px-4
          py-3
          text-center
          tracking-[4px]
          font-bold
          outline-none
          focus:border-purple-500
        "
      />

      <Button
  className="w-full mt-5"
  onClick={activateSubscription}
>
  تفعيل الاشتراك
</Button>

<Button
  variant="outline"
  className="
    w-full
    mt-3
    border-green-500
    text-green-600
    hover:bg-green-500
    hover:text-white
    flex items-center justify-center gap-2
  "
  onClick={() =>
  window.open(
    `https://wa.me/201109414585?text=${encodeURIComponent(
      `السلام عليكم، عايز الاشتراك في كورس ${selectedCourse?.title}`
    )}`,
    "_blank"
  )
}
>
  <FaWhatsapp className="text-xl" />
  شراء كود عبر واتساب
</Button>

      <Button
        variant="outline"
        className="w-full mt-3"
        onClick={() => {
          setShowSubscriptionModal(false);
          setSubscriptionCode("");
        }}
      >
        إلغاء
      </Button>

    </div>

  </div>
)}

  </>
);
}
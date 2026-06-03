import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Play, Star, Users, BookOpen, TrendingUp, ChevronDown, ArrowLeft } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Avatar } from "../components/ui/Avatar";
import { TEACHER, STATS, COURSES, TESTIMONIALS, FAQS, ANNOUNCEMENTS } from "../data/mockData";

const gradeColors: Record<string, string> = {
  third_sec: "rose",
  second_sec: "violet",
  first_sec: "blue",
  primary: "emerald",
};

export function HomePage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const featuredCourses = COURSES.filter(c => c.isFeatured || true).slice(0, 4);

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      <Navbar />

      {/* ── ANNOUNCEMENT BANNER ── */}
      {ANNOUNCEMENTS[0] && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 pt-16">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
              </span>
              <p className="text-white text-sm font-medium">{ANNOUNCEMENTS[0].title}</p>
            </div>
            <button onClick={() => navigate("/dashboard/announcements")} className="text-white/80 hover:text-white text-xs font-medium flex items-center gap-1 flex-shrink-0 whitespace-nowrap">
              عرض الكل <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── HERO SECTION ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 ${!ANNOUNCEMENTS[0] ? "pt-16" : ""}`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 rounded-full px-4 py-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-blue-300 text-sm font-medium">المنصة التعليمية الأولى في الكيمياء</span>
              </div>
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
                  أتقن الكيمياء<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    بكل ثقة
                  </span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  تعلّم مع <span className="text-white font-bold">{TEACHER.nameEn}</span> وحقق أعلى الدرجات. منهج متكامل، شرح مبسط، ونتائج حقيقية.
                </p>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" variant="primary" onClick={() => navigate("/courses")} className="shadow-xl shadow-blue-900/50">
                  <BookOpen size={20} />
                  تصفح الكورسات
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/register")} className="border-white/30 text-white hover:bg-white/10">
                  سجل الآن مجاناً
                  <ChevronRight size={20} />
                </Button>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex -space-x-2 space-x-reverse">
                  {["أ.م", "س.خ", "م.ع", "ن.أ"].map((init, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs font-bold text-white ${["bg-blue-500","bg-emerald-500","bg-violet-500","bg-amber-500"][i]}`}>
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-slate-300 text-sm"><span className="text-white font-bold">2,400+</span> طالب يثق في المنصة</p>
                </div>
              </div>
            </div>

            {/* Image */}
            <div className="relative flex items-center justify-center">
              <div className="relative">
                <div className="w-72 h-80 lg:w-96 lg:h-[420px] rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                  <img
                    src={TEACHER.image}
                    alt={TEACHER.nameEn}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Zeyad+Rabie&size=400&background=1e40af&color=fff&bold=true&font-size=0.33`;
                    }}
                  />
                </div>
                {/* Floating cards */}
                <div className="absolute -right-4 top-8 bg-white rounded-2xl shadow-xl p-4 max-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <TrendingUp size={14} className="text-emerald-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">معدل النجاح</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">98%</p>
                  <p className="text-xs text-slate-400">من الطلاب ينجحون</p>
                </div>
                <div className="absolute -left-4 bottom-16 bg-white rounded-2xl shadow-xl p-4 max-w-[160px]">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Users size={14} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">الطلاب</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900">2,400+</p>
                  <p className="text-xs text-slate-400">طالب مسجل</p>
                </div>
                <div className="absolute -left-4 top-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-xl p-3">
                  <div className="flex items-center gap-1.5">
                    <Play size={14} className="text-white fill-white" />
                    <span className="text-white text-xs font-bold">درس جديد متاح!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-x-reverse divide-slate-100">
            {STATS.map((stat, i) => (
              <div key={i} className="py-10 px-8 text-center">
                <p className="text-4xl lg:text-5xl font-black text-slate-900 mb-1">{stat.value}</p>
                <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEACHER INTRO ── */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="w-full h-[420px] rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={TEACHER.image}
                  alt={TEACHER.nameEn}
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Zeyad+Rabie&size=400&background=1e40af&color=fff&bold=true`;
                  }}
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div><p className="text-2xl font-black text-blue-600">15+</p><p className="text-xs text-slate-500">سنة خبرة</p></div>
                  <div><p className="text-2xl font-black text-emerald-600">98%</p><p className="text-xs text-slate-500">نجاح</p></div>
                  <div><p className="text-2xl font-black text-violet-600">15+</p><p className="text-xs text-slate-500">كورس</p></div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <Badge variant="blue" className="mb-4">من نحن</Badge>
                <h2 className="text-4xl font-black text-slate-900 mb-4">مرحباً، أنا<br />{TEACHER.nameEn}</h2>
                <p className="text-slate-600 leading-relaxed text-lg">{TEACHER.bio}</p>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { icon: "🎓", text: TEACHER.university },
                  { icon: "⏱️", text: TEACHER.experience + " في التدريس" },
                  ...TEACHER.achievements.map(a => ({ icon: "✅", text: a })),
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-100">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-slate-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button size="lg" onClick={() => navigate("/courses")}>
                استعرض الكورسات
                <ArrowLeft size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURED COURSES ── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="blue" className="mb-4">الكورسات المتاحة</Badge>
            <h2 className="text-4xl font-black text-slate-900 mb-4">كورسات مصممة للنجاح</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">منهج متكامل لجميع المراحل الدراسية مع شرح مبسط وتدريبات متنوعة</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {featuredCourses.map(course => (
              <Card key={course.id} hover onClick={() => navigate(`/courses/${course.slug}`)}>
                <div className="relative overflow-hidden rounded-t-2xl">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-44 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=250&fit=crop`;
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <Badge variant={gradeColors[course.grade] as any}>{course.gradeLabel}</Badge>
                  </div>
                  {course.isFree && (
                    <div className="absolute top-3 left-3">
                      <Badge variant="emerald">مجاني</Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="text-white text-xs font-bold">{course.rating}</span>
                  </div>
                </div>
                <CardContent className="space-y-3">
                  <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1"><BookOpen size={12} />{course.lessonsCount} درس</span>
                    <span className="flex items-center gap-1"><Users size={12} />{course.studentsCount.toLocaleString("ar-EG")}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    <span className="font-black text-slate-900 text-base">
                      {course.isFree ? <span className="text-emerald-600">مجاني</span> : `${course.price} جنيه`}
                    </span>
                    <button className="text-blue-600 text-xs font-bold hover:text-blue-700 flex items-center gap-1">
                      عرض <ChevronRight size={14} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center">
            <Button variant="outline" size="lg" onClick={() => navigate("/courses")}>
              عرض جميع الكورسات
              <ArrowLeft size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="blue" className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">آراء الطلاب</Badge>
            <h2 className="text-4xl font-black text-white mb-4">ماذا يقول طلابنا؟</h2>
            <p className="text-slate-400 text-lg">قصص نجاح حقيقية من طلاب يثقون في المنصة</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map(t => (
              <div key={t.id} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-white/10 pt-4">
                  <Avatar name={t.name} size="sm" />
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.grade}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl shadow-blue-200 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
            </div>
            <div className="relative">
              <p className="text-blue-200 font-semibold mb-3">🚀 ابدأ رحلتك الآن</p>
              <h2 className="text-4xl font-black text-white mb-4">مستعد تحقق نتيجة مميزة؟</h2>
              <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">انضم إلى أكثر من 2,400 طالب يتعلمون مع د. زياد ربيع ويحققون أعلى الدرجات</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => navigate("/register")} className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                  سجل الآن — مجاناً
                </Button>
                <Button size="lg" onClick={() => navigate("/courses")} className="bg-blue-500/30 text-white border border-white/30 hover:bg-blue-500/50">
                  تصفح الكورسات
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="blue" className="mb-4">أسئلة شائعة</Badge>
            <h2 className="text-4xl font-black text-slate-900 mb-4">لديك سؤال؟</h2>
            <p className="text-slate-500 text-lg">إجابات على أهم الأسئلة عن المنصة</p>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-right"
                >
                  <span className="font-bold text-slate-900 text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5">
                    <p className="text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

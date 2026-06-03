import { useNavigate, useParams } from "react-router-dom";
import { Star, Users, BookOpen, Clock, ChevronRight, Play, Lock, FileText, CheckCircle, Award, Download } from "lucide-react";
import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card, CardContent } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { COURSES, TEACHER } from "../data/mockData";
import { useApp } from "../context/AppContext";

const gradeColors: Record<string, string> = {
  third_sec: "rose", second_sec: "violet", first_sec: "blue", primary: "emerald",
};

export function CourseDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useApp();
  const course = COURSES.find(c => c.slug === slug) || COURSES[0];

  const totalDuration = "18 ساعة و 30 دقيقة";
  const isEnrolled = user && user.role === "student";

  return (
    <div className="min-h-screen bg-slate-50" dir="rtl">
      <Navbar />
      <div className="pt-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-900 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-6">
              <button onClick={() => navigate("/")} className="hover:text-white">الرئيسية</button>
              <ChevronRight size={14} />
              <button onClick={() => navigate("/courses")} className="hover:text-white">الكورسات</button>
              <ChevronRight size={14} />
              <span className="text-white truncate max-w-[200px]">{course.title}</span>
            </div>
            <div className="grid lg:grid-cols-3 gap-10 items-start">
              {/* Left: Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={gradeColors[course.grade] as any}>{course.gradeLabel}</Badge>
                  <Badge variant="slate">{course.typeLabel}</Badge>
                  {course.isFree && <Badge variant="emerald">مجاني</Badge>}
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-white">{course.title}</h1>
                <p className="text-slate-300 text-lg leading-relaxed">{course.description}</p>
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-1.5 text-amber-400">
                    <Star size={16} className="fill-amber-400" />
                    <span className="font-bold text-white">{course.rating}</span>
                    <span className="text-slate-400">({course.studentsCount.toLocaleString("ar-EG")} تقييم)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Users size={16} />
                    <span>{course.studentsCount.toLocaleString("ar-EG")} طالب مسجل</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <BookOpen size={16} />
                    <span>{course.lessonsCount} درس</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock size={16} />
                    <span>{totalDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={TEACHER.nameEn} size="md" />
                  <div>
                    <p className="text-white font-bold text-sm">{TEACHER.nameEn}</p>
                    <p className="text-slate-400 text-xs">{TEACHER.titleEn}</p>
                  </div>
                </div>
              </div>
              {/* Right: Enrollment Card */}
              <div className="lg:sticky lg:top-24">
                <Card className="shadow-2xl overflow-hidden">
                  <div className="relative">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-44 object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1554475901-4538ddfbccc2?w=400&h=250&fit=crop`; }}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <Play size={22} className="text-blue-600 fill-blue-600 mr-[-2px]" />
                      </button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-white text-xs">
                      معاينة مجانية
                    </div>
                  </div>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      {course.isFree ? (
                        <p className="text-3xl font-black text-emerald-600">مجاني تماماً</p>
                      ) : (
                        <div>
                          <p className="text-3xl font-black text-slate-900">{course.price} جنيه</p>
                          <p className="text-sm text-slate-500">اشتراك كامل للكورس</p>
                        </div>
                      )}
                    </div>
                    {isEnrolled ? (
                      <Button fullWidth size="lg" onClick={() => navigate("/dashboard/courses")}>
                        <Play size={18} />
                        متابعة الدراسة
                      </Button>
                    ) : (
                      <>
                        <Button fullWidth size="lg" onClick={() => navigate("/register")}>
                          سجل واشترك الآن
                        </Button>
                        <Button fullWidth size="lg" variant="outline" onClick={() => navigate("/login")}>
                          دخول للمشتركين
                        </Button>
                      </>
                    )}
                    <div className="space-y-2 text-sm">
                      {[
                        { icon: <CheckCircle size={14} className="text-emerald-500" />, text: `${course.lessonsCount} درس فيديو` },
                        { icon: <Download size={14} className="text-blue-500" />, text: "ملفات PDF قابلة للتحميل" },
                        { icon: <FileText size={14} className="text-violet-500" />, text: "اختبارات تفاعلية" },
                        { icon: <Award size={14} className="text-amber-500" />, text: "شهادة إتمام الكورس" },
                        { icon: <Clock size={14} className="text-slate-400" />, text: "وصول دائم بدون انقطاع" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-600">
                          {item.icon}
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* What you'll learn */}
              <Card>
                <CardContent>
                  <h2 className="text-xl font-black text-slate-900 mb-5">ماذا ستتعلم؟</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      "فهم عميق للكيمياء العضوية",
                      "حل مسائل الكيمياء بثقة",
                      "تطبيق قوانين الكيمياء الحرارية",
                      "فهم الكيمياء الكهربية",
                      "التدريب على أسئلة البكالوريا",
                      "استيعاب الكيمياء من الصفر",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Course Content */}
              <div>
                <h2 className="text-xl font-black text-slate-900 mb-5">محتوى الكورس</h2>
                {course.units && course.units.length > 0 ? (
                  <div className="space-y-3">
                    {course.units.map((unit, ui) => (
                      <Card key={unit.id}>
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center">
                              {ui + 1}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm">{unit.title}</p>
                              <p className="text-xs text-slate-500">{unit.lessons.length} دروس</p>
                            </div>
                          </div>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {unit.lessons.map(lesson => (
                            <div
                              key={lesson.id}
                              className={`px-4 py-3 flex items-center gap-3 ${lesson.isFree ? "hover:bg-blue-50 cursor-pointer" : "opacity-75"}`}
                              onClick={() => lesson.isFree && navigate("/dashboard/lesson/l1")}
                            >
                              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0">
                                {lesson.type === "quiz" ? (
                                  <FileText size={14} className="text-violet-500" />
                                ) : lesson.isCompleted ? (
                                  <CheckCircle size={14} className="text-emerald-500" />
                                ) : lesson.isFree ? (
                                  <Play size={14} className="text-blue-500" />
                                ) : (
                                  <Lock size={14} className="text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-700 truncate">{lesson.title}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                {lesson.isFree && (
                                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">معاينة</span>
                                )}
                                <span className="text-xs text-slate-400 whitespace-nowrap">{lesson.duration}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="text-center py-10">
                      <BookOpen size={40} className="text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">يتم إعداد المحتوى قريباً</p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Instructor */}
              <Card>
                <CardContent>
                  <h2 className="text-xl font-black text-slate-900 mb-5">عن المدرس</h2>
                  <div className="flex items-start gap-5">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <img
                        src={TEACHER.image}
                        alt={TEACHER.nameEn}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Zeyad+Rabie&size=80&background=1e40af&color=fff`; }}
                      />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg">{TEACHER.nameEn}</h3>
                      <p className="text-blue-600 text-sm font-medium mb-2">{TEACHER.titleEn}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" />4.9 تقييم</span>
                        <span className="flex items-center gap-1"><Users size={12} />2,400+ طالب</span>
                        <span className="flex items-center gap-1"><BookOpen size={12} />15 كورس</span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">{TEACHER.bio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column on desktop - requirements */}
            <div className="space-y-6 hidden lg:block">
              <Card>
                <CardContent>
                  <h3 className="font-black text-slate-900 mb-4">متطلبات الكورس</h3>
                  <ul className="space-y-2">
                    {["فهم أساسيات الكيمياء", "جهاز كمبيوتر أو موبايل", "اتصال إنترنت جيد", "دفتر للملاحظات"].map((req, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {req}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <h3 className="font-black text-slate-900 mb-4">الكورس مناسب لـ</h3>
                  <ul className="space-y-2">
                    {["طلاب الصف الثالث الثانوي", "من يريد فهم الكيمياء بعمق", "الراغبين في رفع درجاتهم", "المستعدين للبكالوريا"].map((aud, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                        {aud}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

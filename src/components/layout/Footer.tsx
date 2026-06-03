import { useNavigate } from "react-router-dom";
import { GraduationCap, Phone, Mail, MapPin, Tv, Star } from "lucide-react";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <GraduationCap size={22} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base">د. زياد ربيع</p>
                <p className="text-xs text-slate-400">منصة تعليمية متخصصة</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              منصة تعليمية متخصصة في الكيمياء والعلوم للمرحلة الابتدائية والثانوية. نهدف إلى تبسيط العلوم وجعلها ممتعة لكل طالب.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors">
                <span className="text-xs font-bold">f</span>
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-red-600 flex items-center justify-center transition-colors">
                <Tv size={16} />
              </a>
              <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-pink-600 flex items-center justify-center transition-colors">
                <Star size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-5">روابط سريعة</h4>
            <ul className="space-y-3">
              {[
                { label: "الرئيسية", path: "/" },
                { label: "الكورسات", path: "/courses" },
                { label: "الطلاب المتميزون", path: "/courses" },
                { label: "إنشاء حساب", path: "/register" },
                { label: "تسجيل الدخول", path: "/login" },
              ].map(link => (
                <li key={link.path}>
                  <button
                    onClick={() => navigate(link.path)}
                    className="text-sm text-slate-400 hover:text-white transition-colors hover:translate-x-1 inline-flex items-center gap-1"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-white font-bold mb-5">الكورسات</h4>
            <ul className="space-y-3">
              {[
                "كيمياء الصف الثالث الثانوي",
                "كيمياء الصف الثاني الثانوي",
                "علوم متكاملة أولى ثانوي",
                "علوم المرحلة الابتدائية",
                "مراجعات نهائية",
              ].map(course => (
                <li key={course}>
                  <button
                    onClick={() => navigate("/courses")}
                    className="text-sm text-slate-400 hover:text-white transition-colors text-right"
                  >
                    {course}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-5">تواصل معنا</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Phone size={14} />
                </div>
                <span>01012345678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Mail size={14} />
                </div>
                <span>dr.zeyad@platform.com</span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MapPin size={14} />
                </div>
                <span>القاهرة، جمهورية مصر العربية</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2024 منصة د. زياد ربيع التعليمية. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-slate-500 hover:text-white transition-colors">سياسة الخصوصية</button>
            <button className="text-sm text-slate-500 hover:text-white transition-colors">شروط الاستخدام</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

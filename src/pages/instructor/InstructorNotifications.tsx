import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Send, 
  Users, 
  GraduationCap, 
  Search, 
  Filter, 
  Plus, 
  X, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  MoreVertical,
  ChevronDown,
  Moon,
  Sun
} from "lucide-react";

// Assuming these components exist in your project structure based on your imports
// If not, standard HTML elements with Tailwind classes are used as fallbacks below
import { DashboardSidebar } from "../../components/layout/DashboardSidebar"; 
// import { Card, CardContent } from "../../components/ui/Card"; 
// import { Button } from "../../components/ui/Button";
// import { Input, Select } from "../../components/ui/Input";
import { supabase } from "../../lib/supabase";

// --- UI Components (Inline for portability if you don't have the files) ---
const Card = ({ className, children }: any) => (
  <div className={`bg-white rounded-3xl border border-slate-100 shadow-sm ${className}`}>{children}</div>
);
const CardContent = ({ className, children }: any) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
const Button = ({ children, className, variant = "primary", onClick, ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-0.5",
    secondary: "bg-white text-slate-700 border-2 border-slate-200 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
  };
  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} onClick={onClick} {...props}>
      {children}
    </button>
  );
};
const Input = ({ className, ...props }: any) => (
  <input className={`w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all ${className}`} {...props} />
);
const Select = ({ className, children, ...props }: any) => (
  <div className="relative">
    <select className={`w-full px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#7C3AED] appearance-none cursor-pointer ${className}`} {...props}>
      {children}
    </select>
    <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
  </div>
);

// --- Main Component ---

export function InstructorNotifications() {
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGrade, setTargetGrade] = useState("جميع الطلاب");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Stats State
  const [stats, setStats] = useState({ total: 0, students: 0, pending: 0 });

  useEffect(() => {
    loadNotifications();
    loadStats();
  }, []);

  const loadStats = async () => {
    // Mock stats for demonstration - replace with real Supabase queries if tables exist
    setStats({ total: notifications.length, students: 1240, pending: 0 });
  };

  const loadNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setNotifications(data);
      setStats(prev => ({ ...prev, total: data.length }));
    }
    setLoading(false);
  };

  const deleteNotification = async (id: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    const { error } = await supabase.from("notifications").delete().eq("id", id);

    if (error) {
      alert("فشل الحذف");
      return;
    }
    loadNotifications();
  };

  const sendNotification = async () => {
    if (!title.trim() || !content.trim()) {
      alert("يرجى ملء جميع الحقول");
      return;
    }

    const { error } = await supabase.from("notifications").insert([
      {
        title,
        content,
        target_grade: targetGrade,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      alert("حدث خطأ أثناء الإرسال");
      return;
    }

    // Reset & Close
    setTitle("");
    setContent("");
    setTargetGrade("جميع الطلاب");
    setIsModalOpen(false);
    loadNotifications();
    
    // Simple success feedback
    alert("تم إرسال الإشعار بنجاح ✅");
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans" dir="rtl">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap'); body { font-family: 'Tajawal', sans-serif; }`}</style>

      {/* Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0 bg-white border-l border-slate-200 h-screen sticky top-0 overflow-y-auto">
        <DashboardSidebar type="instructor" />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        
        {/* Premium Top Bar (Replaces old gradient header) */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white shadow-lg shadow-purple-200">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">مركز الإشعارات</h1>
              <p className="text-sm text-slate-500 font-medium">إدارة التواصل مع الطلاب وأولياء الأمور</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <span className="text-sm font-bold text-slate-600">د. زياد ربيع</span>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-purple-600 font-black border border-slate-100">ز</div>
             </div>
             <Button onClick={() => setIsModalOpen(true)} className="h-12 px-6 rounded-xl gap-2 shadow-purple-200/50">
               <Send size={20} />
               <span className="hidden sm:inline">إرسال جديد</span>
             </Button>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Stat 1 */}
            <Card className="hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 border-none">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold text-sm mb-1">إجمالي الإشعارات</p>
                  <h3 className="text-4xl font-black text-slate-800">{stats.total}</h3>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Bell size={32} strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>

            {/* Stat 2 */}
            <Card className="hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 border-none">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold text-sm mb-1">الطلاب المستهدفون</p>
                  <h3 className="text-4xl font-black text-slate-800">{stats.students}</h3>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Users size={32} strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>

             {/* Stat 3 */}
             <Card className="hover:shadow-xl hover:shadow-amber-100/50 transition-all duration-300 border-none">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="text-slate-500 font-bold text-sm mb-1">قيد الانتظار</p>
                  <h3 className="text-4xl font-black text-slate-800">0</h3>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <AlertCircle size={32} strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>

             {/* Quick Actions Card */}
             <Card className="bg-gradient-to-br from-[#7C3AED] to-[#A855F7] text-white border-none shadow-xl shadow-purple-300/40">
              <CardContent className="flex flex-col justify-center h-full py-4">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  <GraduationCap size={20} />
                  إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm font-bold transition-colors">للجميع</button>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm font-bold transition-colors">للصفوف</button>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm font-bold transition-colors">المتأخرين</button>
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl py-2 text-sm font-bold transition-colors">الأولياء</button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Table Section */}
          <Card className="border-slate-200 overflow-hidden">
            <div className="p-8 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800">سجل الإشعارات</h2>
                <p className="text-slate-500 mt-1 text-sm">عرض جميع الإشعارات المرسلة سابقاً</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <Input placeholder="بحث في الإشعارات..." className="pr-10 h-12" />
                </div>
                <Select className="h-12 w-full sm:w-48">
                  <option>كل الصفوف</option>
                  <option>الصف الأول</option>
                  <option>الصف الثاني</option>
                </Select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                  <tr>
                    <th className="px-8 py-5 rounded-tr-2xl">الإشعار</th>
                    <th className="px-8 py-5">الفئة المستهدفة</th>
                    <th className="px-8 py-5">تاريخ الإرسال</th>
                    <th className="px-8 py-5 rounded-tl-2xl text-center">الحالة</th>
                    <th className="px-8 py-5 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center text-slate-400">جاري التحميل...</td>
                    </tr>
                  ) : notifications.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Bell size={48} strokeWidth={1} />
                          <p className="font-bold">لا توجد إشعارات مرسلة حتى الآن</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    notifications.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-8 py-5">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                              <Bell size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-base">{item.title}</h4>
                              <p className="text-slate-500 text-sm mt-1 line-clamp-1">{item.content}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {item.target_grade}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-medium text-sm dir-ltr text-right">
                          {new Date(item.created_at).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span className="inline-flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                            <CheckCircle size={14} />
                            تم الإرسال
                          </span>
                        </td>
                        <td className="px-8 py-5 text-left">
                          <Button 
                            variant="ghost" 
                            className="w-10 h-10 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteNotification(item.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </main>

      {/* Send Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-[#7C3AED] to-[#A855F7] p-6 flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send size={24} />
                إنشاء إشعار جديد
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white hover:bg-white/20 rounded-lg p-2 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">عنوان الإشعار</label>
                <Input 
                  value={title} 
                  onChange={(e: any) => setTitle(e.target.value)} 
                  placeholder="مثال: امتحان منتصف الفصل" 
                  className="h-14 text-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">الفئة المستهدفة</label>
                <Select value={targetGrade} onChange={(e: any) => setTargetGrade(e.target.value)} className="h-14">
                  <option>جميع الطلاب</option>
                  <option>الصف الأول الثانوي</option>
                  <option>الصف الثاني الثانوي</option>
                  <option>الصف الثالث الثانوي</option>
                  <option>أولياء الأمور فقط</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">محتوى الإشعار</label>
                <textarea 
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-purple-100 transition-all min-h-[120px] resize-none"
                  placeholder="اكتب تفاصيل الإشعار هنا..."
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl text-lg">
                  إلغاء
                </Button>
                <Button onClick={sendNotification} className="flex-1 h-14 rounded-2xl text-lg shadow-xl shadow-purple-200">
                  إرسال الإشعار
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
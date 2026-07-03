import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Users,
  GraduationCap,
  Search,
  X,
  Trash2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
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
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
const [gradeFilter, setGradeFilter] = useState("الكل");
const [type,setType]=useState("عام");
  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGrade, setTargetGrade] = useState("جميع الطلاب");
  const [isModalOpen, setIsModalOpen] = useState(false);
const [sending,setSending]=useState(false);
  // Stats State
  
  useEffect(() => {
  loadNotifications();
  
}, []);
const notificationTypes = {
  عام: {
    color: "bg-purple-100 text-purple-700",
    icon: Bell,
  },

  محاضرة: {
    color: "bg-blue-100 text-blue-700",
    icon: GraduationCap,
  },

  واجب: {
    color: "bg-orange-100 text-orange-700",
    icon: AlertCircle,
  },

  امتحان: {
    color: "bg-red-100 text-red-700",
    icon: CheckCircle,
  },
};

  const loadNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      
      .order("created_at", { ascending: false });

   if (!error && data) {
  setNotifications(data);
}

    setLoading(false);
  };

const deleteNotification = async (id:number)=>{

if(!confirm("حذف الإشعار ؟")) return;

const {error}=await supabase
.from("notifications")
.delete()
.eq("id",id);

if(error){

alert(error.message);

return;

}

setNotifications(prev=>

prev.filter(n=>n.id!==id)

);

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

type:type,
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
    const {data}=await supabase
.from("notifications")
.select("*")
.order("created_at",{ascending:false});

setNotifications(data||[]);
    setSearch("");

setGradeFilter("الكل");
    // Simple success feedback
    alert("تم إرسال الإشعار بنجاح ✅");
  };

  const filteredNotifications = notifications.filter((item) => {

  const matchesSearch =
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.content?.toLowerCase().includes(search.toLowerCase());

  const matchesGrade =
    gradeFilter === "الكل" ||
    item.target_grade === gradeFilter;

  return matchesSearch && matchesGrade;

});

 
}
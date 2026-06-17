import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Star, Plus, Edit, Trash2 } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";

export function InstructorCourses() {
  
  const navigate = useNavigate();
useEffect(() => {

  loadCourses();
}, []);

const loadCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("id");

  

  if (error) {
    
    return;
  }

  

  setCourses(data || []);

  
};

const deleteCourse = async (id: string) => {
  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (!error) {
    loadCourses();
  }
};

const [courses, setCourses] = useState<any[]>([]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        
        {/* Header */}
        <div className="bg-white dark:bg-[#130726] border-b border-slate-200 px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              كورساتي
            </h1>
            <p className="text-slate-500 text-sm">
              إدارة جميع الكورسات الخاصة بك
            </p>
          </div>

          <Button
            onClick={() => navigate("/instructor/courses/create")}
          >
            <Plus size={16} />
            إنشاء كورس
          </Button>
        </div>
        

        {/* Content */}
        <div className="p-6 space-y-4">
          {courses.map((course) => (
            
            <Card key={course.id}>
              <CardContent className="flex flex-col md:flex-row gap-4">

               <img
  src={
    course.thumbnail ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3"
  }
  alt={course.title}
  className="w-full md:w-40 h-28 rounded-xl object-cover"
/>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-xl text-slate-900 line-clamp-2">
                      {course.title}
                    </h2>
                    <p className="text-slate-500 text-sm mt-2 line-clamp-2">
  {course.description}
</p>

                    <span>منشور</span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">

                    

                  </div>

                  <div className="flex items-center justify-between">

                    <span dir="rtl">
  {course.price} ج
</span>

                    <div className="flex gap-2">

                      <Button size="sm" variant="outline">
                        <Edit size={14} />
                        تعديل
                      </Button>

                      
<Button
  size="sm"
  variant="danger"
  onClick={() => deleteCourse(course.id)}
>
  حذف
</Button>
                    </div>
                  </div>
                </div>

              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
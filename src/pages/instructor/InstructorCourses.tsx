import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { CourseHero } from "../../components/instructor-courses/CourseHero";
import { CourseStats } from "../../components/instructor-courses/CourseStats";
import { CourseAlert } from "../../components/instructor-courses/CourseAlert";
import { CourseFilters } from "../../components/instructor-courses/CourseFilters";
import { CourseGrid } from "../../components/instructor-courses/CourseGrid";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";
import { useApp } from "../../context/AppContext";

export function InstructorCourses() {

const navigate = useNavigate();
const { user } = useApp();
const [courses, setCourses] = useState<any[]>([]);
const [sidebarOpen, setSidebarOpen] = useState(false);

const [search, setSearch] = useState("");
const [gradeFilter, setGradeFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
const [sortBy, setSortBy] = useState("latest");
const [view, setView] = useState<"grid" | "list">("grid");

useEffect(() => {
  if (user) {

    loadCourses();

  }
}, [user]);

const filteredCourses = courses
  .filter((course) => {
   const keyword = search.trim().toLowerCase();

const matchSearch =
  keyword === "" ||
  course.title?.toLowerCase().includes(keyword) ||
  course.description?.toLowerCase().includes(keyword) ||
  course.teacher_name?.toLowerCase().includes(keyword) ||
  course.grade?.toLowerCase().includes(keyword);

    const matchGrade =
      gradeFilter === "all" ||
      course.grade === gradeFilter;

 const matchStatus =
  statusFilter === "all" ||
  (statusFilter === "published" && course.is_published) ||
(statusFilter === "draft" && !course.is_published);

    return matchSearch && matchGrade && matchStatus;

  })
  .sort((a, b) => {
    switch (sortBy) {
      case "oldest":
        return a.id.localeCompare(b.id);

      case "price-low":
        return a.price - b.price;

      case "price-high":
        return b.price - a.price;

      default:
        return b.id.localeCompare(a.id);
    }
  });

const loadCourses = async () => {
const { data, error } = await supabase
  .from("courses")
  .select(`
    *,
    course_sections(
      *,
      course_items(*)
    )
  `)
  .eq("teacher_id", user?.id)
  .order("created_at", {
    ascending: false,
  });

  const { data: subscriptions } = await supabase
  .from("student_courses")
  .select("student_id, course_id, active");

if (error) {

  return;
}

const coursesWithStudents = (data || []).map((course) => {

  const students = (subscriptions || []).filter(
    (s: any) =>
      s.active &&
      String(s.course_id) === String(course.id)
  );

  const uniqueStudents = new Set(
    students.map((s: any) => s.student_id)
  );

  return {
    ...course,
    students_count: uniqueStudents.size,
  };

});

setCourses(coursesWithStudents);

};


const toggleFeature = async (id: string) => {
  const course = courses.find((c) => c.id === id);
  if (!course) return;

  const newValue = !course.is_featured;

  const { error } = await supabase
    .from("courses")
    .update({ is_featured: newValue })
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("حدث خطأ أثناء تحديث الكورس");
    return;
  }

  setCourses((prev) =>
    prev.map((c) =>
      c.id === id ? { ...c, is_featured: newValue } : c
    )
  );
};

const deleteCourse = async (id: string) => {
  if (!confirm("هل أنت متأكد من حذف الكورس؟")) return;

  const { error } = await supabase
    .from("courses")
    .delete()
    .eq("id", id);

  if (error) {
  console.error(error);
  alert(error.message);
  return;
}
  loadCourses();
};

return (
  <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>

    {/* Hero */}
    <div className="mb-4 sm:mb-6">
      <CourseHero
        onCreateCourse={() => navigate("/instructor/courses/create")}
        onCreateGeneralCourse={() => navigate("/instructor/courses/create?type=general")}
        totalCourses={courses.length}
        publishedCourses={courses.filter((c) => c.is_published).length}
        totalStudents={courses.reduce((sum, c) => sum + (c.students_count || 0), 0)}
        view={view}
        setView={setView}
      />
    </div>

    {/* Stats + Alert + Filters + Grid */}
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <CourseStats courses={courses} />
      <CourseAlert courses={courses} />
      <CourseFilters
        search={search}
        setSearch={setSearch}
        gradeFilter={gradeFilter}
        setGradeFilter={setGradeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        view={view}
        setView={setView}
        resultsCount={filteredCourses.length}
      />
      <CourseGrid
        courses={filteredCourses}
        onDelete={deleteCourse}
        onFeature={toggleFeature}
        view={view}
      />
    </div>

  </DashboardLayout>
);
}
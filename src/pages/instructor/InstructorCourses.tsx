import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { supabase } from "../../lib/supabase";
import { useEffect, useState } from "react";
import { CourseHero } from "../../components/instructor-courses/CourseHero";
import { CourseStats } from "../../components/instructor-courses/CourseStats";
import { CourseAlert } from "../../components/instructor-courses/CourseAlert";
import { CourseFilters } from "../../components/instructor-courses/CourseFilters";
import { CourseGrid } from "../../components/instructor-courses/CourseGrid";
import { exportCoursesCSV } from "../../utils/exportCourses";
import { useApp } from "../../context/AppContext";

export function InstructorCourses() {
  
const navigate = useNavigate();
const { user } = useApp();
const [courses, setCourses] = useState<any[]>([]);

const [search, setSearch] = useState("");
const [gradeFilter, setGradeFilter] = useState("all");
const [statusFilter, setStatusFilter] = useState("all");
const [sortBy, setSortBy] = useState("latest");
const [view, setView] = useState<"grid" | "list">("grid");

useEffect(() => {
  if (user) {
    console.log("APP USER =", user);
    loadCourses();
    console.log("Teacher ID =", user?.id);
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

  if (error) {
    console.error(error);
    return;
  }

  setCourses(data || []);
  console.log("COURSES =", data);
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
    <div
  className="flex min-h-screen bg-[#F8FAFC]"
  dir="rtl"
>
      <div className="hidden lg:block">
        <DashboardSidebar type="instructor" />
      </div>

<main
  className="
    flex-1
    overflow-y-auto
    bg-slate-50
    p-6
  "
>
<CourseHero
  onCreateCourse={() =>
    navigate("/instructor/courses/create")
  }

  onExport={() =>
    exportCoursesCSV(filteredCourses)
  }

  totalCourses={courses.length}

  publishedCourses={
   courses.filter(
  (c) => c.is_published
).length
  }

  totalStudents={
    courses.reduce(
      (sum, c) =>
        sum + (c.students_count || 0),
      0
    )
  }

  view={view}

  setView={setView}
/>

  <div className="mt-6">
    <CourseStats courses={courses} />
  </div>

  <div className="mt-6">
    <CourseAlert
  courses={courses}
/>
  </div>

  <div className="mt-6">
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

  </div>

  <div className="mt-8">
   <CourseGrid
  courses={filteredCourses}
  onDelete={deleteCourse}
  view={view}
/>

  </div>

  
</main>

    </div>
  );
}
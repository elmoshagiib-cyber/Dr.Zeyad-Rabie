import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

console.log(XLSX);
console.log(saveAs);

export const exportCoursesCSV = (courses: any[]) => {
  const data = courses.map((course) => ({
    "اسم الكورس": course.title,
    "الوصف": course.description,
    "السعر": course.price,
    "الصف": course.grade,
    "الحالة": course.status,
    "عدد الطلاب": course.students_count || 0,
    "تاريخ الإنشاء": course.created_at,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);

  const csv = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  saveAs(blob, "Courses.csv");
};
import { useState } from "react";
import { DashboardLayout } from "../../components/layout/dashboard/DashboardLayout";

export function InstructorContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardLayout type="instructor" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
      <div dir="rtl" className="min-h-screen bg-white">
        {/* هنا هنضيف محتوى الصفحة لاحقًا */}
      </div>
    </DashboardLayout>
  );
}
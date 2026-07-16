import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { QrCode } from "lucide-react";

export function InstructorAttendance() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]" dir="rtl">
      <div className="hidden lg:block">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-100">
            <QrCode className="h-10 w-10 text-violet-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-800">
            صفحة الحضور والانصراف
          </h1>

          <p className="mt-3 text-slate-500">
            هذه الصفحة قيد التطوير وستكون متاحة قريبًا.
          </p>
        </div>
      </main>
    </div>
  );
}
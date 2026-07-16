import { DashboardSidebar } from "../../components/layout/DashboardSidebar";

export function InstructorNotifications() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]" dir="rtl">
      <div className="hidden lg:block">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">
            صفحة الإشعارات
          </h1>

          <p className="mt-3 text-slate-500">
            هذه الصفحة قيد التطوير.
          </p>
        </div>
      </main>
    </div>
  );
}
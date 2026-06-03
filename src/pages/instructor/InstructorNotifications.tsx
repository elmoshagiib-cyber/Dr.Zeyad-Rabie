import { Bell, Send, Users, GraduationCap } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";

export function InstructorNotifications() {
  const notifications = [
    {
      id: 1,
      title: "موعد الامتحان القادم",
      target: "جميع الطلاب",
      date: "2026-06-03",
    },
    {
      id: 2,
      title: "تم رفع واجب جديد",
      target: "الصف الثالث الثانوي",
      date: "2026-06-01",
    },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <h1 className="text-2xl font-black text-slate-900">
            الإشعارات
          </h1>

          <p className="text-slate-500 text-sm">
            إرسال وإدارة إشعارات الطلاب
          </p>
        </div>

        <div className="p-6 space-y-6">

          {/* Create Notification */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="font-black text-lg">
                إنشاء إشعار جديد
              </h2>

              <Input
                label="عنوان الإشعار"
                placeholder="اكتب عنوان الإشعار"
              />

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  محتوى الإشعار
                </label>

                <textarea
                  rows={4}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="اكتب نص الإشعار..."
                />
              </div>

              <Select label="إرسال إلى">
                <option>جميع الطلاب</option>
                <option>الصف الأول الثانوي</option>
                <option>الصف الثاني الثانوي</option>
                <option>الصف الثالث الثانوي</option>
              </Select>

              <Button>
                <Send size={16} />
                إرسال الإشعار
              </Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-4">

            <Card>
              <CardContent className="flex items-center gap-4">
                <Bell size={30} className="text-blue-600" />
                <div>
                  <p className="text-sm text-slate-500">
                    إجمالي الإشعارات
                  </p>
                  <p className="text-2xl font-black">
                    38
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4">
                <Users size={30} className="text-emerald-600" />
                <div>
                  <p className="text-sm text-slate-500">
                    الطلاب المستهدفون
                  </p>
                  <p className="text-2xl font-black">
                    325
                  </p>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Notifications List */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-2 mb-5">
                <GraduationCap size={20} />
                <h2 className="font-black text-lg">
                  آخر الإشعارات
                </h2>
              </div>

              <div className="space-y-4">
                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className="border rounded-xl p-4"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">
                          {item.title}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {item.target}
                        </p>
                      </div>

                      <span className="text-sm text-slate-400">
                        {item.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}
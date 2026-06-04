import { useParams } from "react-router-dom";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";

export function EditStudent() {
  const { id } = useParams();

  return (
    <div
      className="flex h-screen bg-slate-50 overflow-hidden"
      dir="rtl"
    >
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto p-6">

        <Card>
          <CardContent className="space-y-4">

            <h1 className="text-2xl font-black">
              تعديل بيانات الطالب
            </h1>

            <Input
              defaultValue="أحمد محمد"
              placeholder="اسم الطالب"
            />

            <Input
              defaultValue="01012345678"
              placeholder="رقم الطالب"
            />

            <Input
              defaultValue="01098765432"
              placeholder="رقم ولي الأمر"
            />

            <Input
              defaultValue="الصف الثالث الثانوي"
              placeholder="الصف الدراسي"
            />

            <Button>
              حفظ التعديلات
            </Button>

          </CardContent>
        </Card>

      </main>
    </div>
  );
}
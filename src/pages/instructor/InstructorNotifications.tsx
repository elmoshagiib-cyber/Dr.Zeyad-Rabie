import { Bell, Send, Users, GraduationCap } from "lucide-react";
import { DashboardSidebar } from "../../components/layout/DashboardSidebar";
import { Card, CardContent } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Select } from "../../components/ui/Input";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";


export function InstructorNotifications() {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] =
  useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetGrade, setTargetGrade] = useState("جميع الطلاب");
  const [studentsCount, setStudentsCount] =
useState(0);
  const [settings, setSettings] =
useState<any[]>([]);

useEffect(() => {
  loadNotifications();
  const loadSettings = async () => {
  const { data } = await supabase
    .from("notification_settings")
    .select("*");

  if (data) {
    setSettings(data);
  }
};

const saveSettings = async (
  id: number,
  enabled: boolean
) => {
  await supabase
    .from("notification_settings")
    .update({
      enabled,
    })
    .eq("id", id);

  loadSettings();
};
}, []);

const loadNotifications = async () => {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (!error && data) {
    setNotifications(data);
  }
};

const deleteNotification = async (id: number) => {
  const confirmed = window.confirm(
    "هل تريد حذف الإشعار؟"
  );

  if (!confirmed) return;

  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("فشل الحذف");
    return;
  }

  loadNotifications();
};

const sendNotification = async () => {
  if (!title.trim() || !content.trim()) {
    alert("اكمل البيانات");
    return;
  }

  const { error } = await supabase
    .from("notifications")
    .insert([
      {
        title,
        content,
        target_grade: targetGrade,
      },
    ]);

  if (error) {
    console.error(error);
    alert("حدث خطأ");
    return;
  }

  setTitle("");
  setContent("");
  setTargetGrade("جميع الطلاب");

  loadNotifications();

  alert("تم إرسال الإشعار بنجاح");
};

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" dir="rtl">
      <div className="hidden lg:block flex-shrink-0">
        <DashboardSidebar type="instructor" />
      </div>

      <main className="flex-1 overflow-y-auto">
        <div
className="
relative
overflow-hidden
rounded-3xl
bg-gradient-to-l
from-blue-700
via-blue-600
to-blue-500
p-8
text-white
shadow-lg
mb-6
"
>

<div className="flex items-center justify-between">

<div>

<h1 className="text-4xl font-black">
الإشعارات
</h1>

<p className="text-blue-100 mt-2">
إرسال وإدارة إشعارات الطلاب بالمنصة
</p>

</div>

<div
className="
w-16
h-16
rounded-3xl
bg-white/10
backdrop-blur-sm
flex
items-center
justify-center
"
>
<Bell size={32}/>
</div>

</div>

</div>

        <div className="p-6 space-y-6">
          <div className="flex justify-end gap-3 mb-6">

<Button
onClick={() => setShowHistory(!showHistory)}
className={`
rounded-2xl h-11 px-5
${showHistory
? "bg-blue-600 text-white border-blue-600"
: ""
}
`}
>
<Bell size={16}/>
سجل الإشعارات
</Button>

<Button
variant="outline"
className="
rounded-2xl
h-11
px-5
"
>
الإعدادات
</Button>

</div>

{showHistory && (

<Card
className="
border
border-slate-200
rounded-3xl
shadow-none
overflow-hidden
"
>

<CardContent className="p-0">

<div
className="
bg-gradient-to-l
from-slate-800
to-slate-900
text-white
p-6
"
>

<div className="flex items-center justify-between">

<div>

<h2 className="text-2xl font-black">
سجل الإشعارات
</h2>

<p className="text-slate-300 mt-1">
جميع الإشعارات المرسلة
</p>

</div>

<div
className="
w-14
h-14
rounded-2xl
bg-white/10
flex
items-center
justify-center
"
>
<Bell size={26}/>
</div>

</div>

</div>

<div className="p-6">

<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="bg-slate-50">

<th className="px-6 py-4">
#
</th>

<th className="px-6 py-4 text-right">
العنوان
</th>

<th className="px-6 py-4 text-right">
المستهدف
</th>

<th className="px-6 py-4 text-right">
التاريخ
</th>

<th className="px-6 py-4 text-center">
الإجراءات
</th>

</tr>

</thead>

{notifications.length === 0 ? (
  <div className="py-16 text-center">
    <Bell
      size={60}
      className="mx-auto text-slate-300"
    />

    <p className="mt-4 text-slate-500">
      لا توجد إشعارات حالياً
    </p>
  </div>
) : (
  <table className="w-full">
    ...
  </table>
)}

</table>

</div>

</div>

</CardContent>

</Card>

)}

          {/* Create Notification */}
          <Card
className="
border
border-slate-200
rounded-3xl
bg-gradient-to-b
from-white
to-slate-50
shadow-none
"
>
            <CardContent className="space-y-6 p-8">
              <div className="flex items-center gap-3">

<div
className="
w-11
h-11
rounded-2xl
bg-violet-100
flex
items-center
justify-center
"
>
<Bell
size={20}
className="text-violet-600"
/>
</div>

<div>
<h2 className="font-black text-lg">
إنشاء إشعار جديد
</h2>

<p className="text-sm text-slate-500">
إرسال إشعارات مباشرة للطلاب
</p>
</div>

</div>

              <Input
value={title}
onChange={(e) => setTitle(e.target.value)}
label="عنوان الإشعار"
/>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  محتوى الإشعار
                </label>

                <textarea
  value={content}
  onChange={(e) => setContent(e.target.value)}
  rows={4}
  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
  placeholder="اكتب نص الإشعار..."
/>

              </div>

              <Select
label="إرسال إلى"
value={targetGrade}
onChange={(e) =>
  setTargetGrade(e.target.value)
}
>
  <option value="جميع الطلاب">
    جميع الطلاب
  </option>

  <option value="الصف الأول الثانوي">
    الصف الأول الثانوي
  </option>

  <option value="الصف الثاني الثانوي">
    الصف الثاني الثانوي
  </option>

  <option value="الصف الثالث الثانوي">
    الصف الثالث الثانوي
  </option>

  <option value="الصف الأول الإعـدادي">
    الصف الأول الإعـدادي
  </option>

   <option value="الصف الأول الإعـدادي">
    الصف الأول الإعـدادي
  </option>

  <option value="الصف الثاني الإعـدادي">
    الصف الثاني الإعـدادي
  </option>

  <option value="الصف الثالث الإعـدادي">
    الصف الثالث الإعـدادي
  </option>

</Select>
              
<Button onClick={sendNotification}>
<Send size={16}/>
إرسال الإشعار
</Button>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="grid md:grid-cols-2 gap-4">

            <Card
className="
border
border-slate-200
rounded-3xl
shadow-none
hover:border-blue-200
transition-all
duration-300
"
>
              <CardContent
className="
flex
items-center
justify-between
p-6
"
>
                <Bell size={30} className="text-blue-600" />
                <div>
<p className="text-sm text-slate-500">
إجمالي الإشعارات
</p>

<p className="text-3xl font-black mt-1">
{notifications.length}
</p>
</div>

<div
className="
w-14
h-14
rounded-2xl
bg-blue-100
flex
items-center
justify-center
"
>
<Bell
size={28}
className="text-blue-600"
/>
</div>
              </CardContent>
            </Card>

            <Card
className="
border
border-slate-200
rounded-3xl
shadow-none
hover:border-emerald-200
transition-all
duration-300
"
>
<CardContent className="flex items-center justify-between p-6">
                <Users size={30} className="text-emerald-600" />
                <div>
<p className="text-sm text-slate-500">
الطلاب المستهدفون
</p>

<p className="text-3xl font-black mt-1">

</p>
</div>

<div
className="
w-14
h-14
rounded-2xl
bg-emerald-100
flex
items-center
justify-center
"
>
<Users
size={28}
className="text-emerald-600"
/>
</div>
              </CardContent>
            </Card>

          </div>

          {/* Notifications List */}
          <Card
className="
bg-white
border
border-slate-200
rounded-3xl
overflow-hidden
shadow-none
"
>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
  <GraduationCap size={20}/>
  <h2 className="font-black text-xl">
    آخر الإشعارات
  </h2>
</div>

<span className="text-sm text-slate-500">
آخر التحديثات المرسلة
</span>

              </div>

<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="bg-slate-50">

<th className="
px-6
py-5
text-xs
font-black
text-slate-500
">
#
</th>

<th className="
px-6
py-5
text-xs
font-black
text-slate-500
">
العنوان
</th>

<th className="
px-6
py-5
text-xs
font-black
text-slate-500
">
المستهدف
</th>

<th className="
px-6
py-5
text-xs
font-black
text-slate-500
">
</th>

<th className="px-4 py-4 text-center">
الإجراءات
</th>

</tr>

</thead>

<tbody>

{notifications.map((item,index)=>(

<tr
key={item.id}
className="
border-b
border-slate-100
hover:bg-slate-50
"
>

<td className="px-4 py-5">
{index + 1}
</td>

<td className="px-4 py-5 font-bold">
{item.title}
</td>

<td className="px-4 py-5">
{item.target_grade}
</td>

<td className="px-4 py-5 text-slate-500">
{new Date(item.created_at)
.toLocaleDateString("ar-EG")}
</td>

<td className="px-4 py-5">

<div className="flex justify-center gap-2">

<Button
size="sm"
className="
w-10
h-10
rounded-xl
bg-violet-50
text-violet-600
hover:bg-violet-100
border-0
shadow-none
"
>
<Bell size={15}/>
</Button>

<Button
size="sm"
className="
w-10
h-10
rounded-xl
bg-red-50
text-red-600
hover:bg-red-100
border-0
shadow-none
"
>
<svg
width="14"
height="14"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
>
<path d="M3 6h18"/>
<path d="M8 6V4h8v2"/>
<path d="M19 6l-1 14H6L5 6"/>
</svg>
</Button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

            </CardContent>
          </Card>
<Button
className="
bg-blue-600
hover:bg-blue-700
rounded-2xl
h-12
px-8
"
>
حفظ التعديلات
</Button>
        </div>
      </main>
    </div>
  );
}
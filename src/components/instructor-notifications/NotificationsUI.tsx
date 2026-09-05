import {
  Send,
  History,
  Trash2,
  Bell,
  CalendarDays,
  EyeOff,
  GraduationCap,
  Search,
  RotateCcw,
} from "lucide-react";
import { NotificationCard } from "./NotificationCard";

/* ============================================================
   NotificationActions
   ============================================================ */

type NotificationActionsProps = {
  onSend: () => void;
  onHistory: () => void;
  onDeleteAll: () => void;
};

export function NotificationActions({
  onSend,
  onHistory,
  onDeleteAll,
}: NotificationActionsProps) {
  return (
    <div
      className="
      mt-8
      flex
      flex-wrap
      items-center
      gap-4
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      "
    >

      <button
        onClick={onSend}
        className="
        flex
        items-center
        gap-2
        rounded-2xl
        bg-[#1E1B3A]
        px-6
        py-3
        font-bold
        text-white
        transition
        hover:scale-105
        "
      >
        <Send size={18}/>
        إرسال إشعار
      </button>

      <button
        onClick={onHistory}
        className="
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-6
        py-3
        font-semibold
        transition
        hover:bg-slate-50
        "
      >
        <History size={18}/>
        سجل الإشعارات
      </button>

      <button
        onClick={onDeleteAll}
        className="
        mr-auto
        flex
        items-center
        gap-2
        rounded-2xl
        bg-red-50
        px-6
        py-3
        font-semibold
        text-red-600
        transition
        hover:bg-red-100
        "
      >
        <Trash2 size={18}/>
        حذف الكل
      </button>

    </div>
  );
}

/* ============================================================
   NotificationFilters
   ============================================================ */

type NotificationFiltersProps = {
  search: string;
  setSearch: (v: string) => void;

  grade: string;
  setGrade: (v: string) => void;

  type: string;
  setType: (v: string) => void;
};

export function NotificationFilters({

  search,
  setSearch,

  grade,
  setGrade,

  type,
  setType,

}: NotificationFiltersProps) {

  return (

<div
className="
mt-8
rounded-[28px]
border
border-slate-200
bg-white
p-6
shadow-sm
"
>

<div className="mb-6">

<h2 className="text-3xl font-black">

البحث والفلاتر

</h2>

<p className="mt-2 text-slate-500">

اعثر على أي إشعار خلال ثوانٍ.

</p>

</div>

<div className="grid gap-5 xl:grid-cols-4">

<div className="relative xl:col-span-2">

<Search
size={20}
className="
absolute
left-4
top-1/2
-translate-y-1/2
text-slate-400
"
/>

<input

value={search}

onChange={(e)=>

setSearch(e.target.value)

}

placeholder="ابحث بالعنوان أو المحتوى..."

className="
h-14
w-full
rounded-2xl
border
border-slate-200
bg-slate-50
pr-5
pl-12
outline-none
transition
focus:border-[#1E1B3A]
"
/>

</div>

<select

value={grade}

onChange={(e)=>

setGrade(e.target.value)

}

className="
h-14
rounded-2xl
border
border-slate-200
bg-slate-50
px-4
"

>

<option>الكل</option>

<option>الأولى</option>

<option>الثانية</option>

<option>الثالثة</option>

</select>

<select

value={type}

onChange={(e)=>

setType(e.target.value)

}

className="
h-14
rounded-2xl
border
border-slate-200
bg-slate-50
px-4
"

>

<option>الكل</option>

<option>عام</option>

<option>محاضرة</option>

<option>واجب</option>

<option>امتحان</option>

</select>

</div>

<button

onClick={()=>{

setSearch("");

setGrade("الكل");

setType("الكل");

}}

className="
mt-6
flex
items-center
gap-2
rounded-2xl
border
border-[#1E1B3A]/20
px-5
py-3
font-semibold
text-[#1E1B3A]
transition
hover:bg-[#1E1B3A]/5
"

>

<RotateCcw size={18}/>

إعادة التعيين

</button>

</div>

);

}

/* ============================================================
   NotificationsHero
   ============================================================ */

type NotificationsHeroProps = {
  total: number;
  today: number;
  unread: number;
  onSend: () => void;
  onHistory: () => void;
};

export function NotificationsHero({
  total,
  today,
  unread,
  onSend,
  onHistory,
}: NotificationsHeroProps) {
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-[32px]
      bg-gradient-to-r
      from-[#0F172A]
      via-[#1E1B3A]
      to-[#2A1B4D]
      p-10
      text-white
      shadow-xl
      "
    >
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div>

          <h1 className="text-5xl font-black">
            إدارة الإشعارات
          </h1>

          <p className="mt-4 text-lg text-white/70 max-w-xl">
            إرسال وإدارة جميع إشعارات الطلاب داخل المنصة من مكان واحد.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              onClick={onSend}
              className="
              h-14
              rounded-2xl
              bg-white
              px-7
              font-bold
              text-[#1E1B3A]
              transition
              hover:scale-105
              "
            >
              <div className="flex items-center gap-2">
                <Send size={18}/>
                إرسال إشعار
              </div>
            </button>

            <button
              onClick={onHistory}
              className="
              h-14
              rounded-2xl
              border
              border-white/20
              bg-white/10
              px-7
              backdrop-blur
              transition
              hover:bg-white/20
              "
            >
              <div className="flex items-center gap-2">
                <History size={18}/>
                سجل الإشعارات
              </div>
            </button>

          </div>

        </div>


      </div>
    </div>
  );
}

/* ============================================================
   NotificationStats
   ============================================================ */

type NotificationStatsProps = {
  total: number;
  today: number;
  unread: number;
  grades: number;
};

export function NotificationStats({
  total,
  today,
  unread,
  grades,
}: NotificationStatsProps) {

  const stats = [

    {
      title: "إجمالي الإشعارات",
      value: total,
      icon: Bell,
      color: "bg-[#1E1B3A]/10 text-[#1E1B3A]",
    },

    {
      title: "إشعارات اليوم",
      value: today,
      icon: CalendarDays,
      color: "bg-blue-100 text-blue-700",
    },

    {
      title: "غير المقروءة",
      value: unread,
      icon: EyeOff,
      color: "bg-orange-100 text-orange-700",
    },

    {
      title: "الصفوف",
      value: grades,
      icon: GraduationCap,
      color: "bg-emerald-100 text-emerald-700",
    },

  ];

  return (

<div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">

{stats.map((item)=>{

const Icon=item.icon;

return(

<div
key={item.title}
className="
rounded-[28px]
border
border-slate-200
bg-white
p-6
shadow-sm
transition-all
duration-300
hover:-translate-y-1
hover:shadow-lg
"
>

<div className="flex items-center justify-between">

<div>

<p className="text-slate-500">

{item.title}

</p>

<h2 className="mt-3 text-4xl font-black">

{item.value}

</h2>

</div>

<div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${item.color}`}>

<Icon size={24}/>

</div>

</div>

</div>

);

})}

</div>

);

}

/* ============================================================
   NotificationTable
   ============================================================ */

type NotificationTableProps = {
  notifications: any[];
  onDelete: (id: number) => void;
};

export function NotificationTable({
  notifications,
  onDelete,
}: NotificationTableProps) {

  return (

    <div
      id="notifications-table"
      className="
      mt-8
      grid
      gap-6
      lg:grid-cols-2
      2xl:grid-cols-3
      "
    >

      {notifications.length > 0 ? (

        notifications.map((notification) => (

          <NotificationCard
            key={notification.id}
            notification={notification}
            onDelete={onDelete}
          />

        ))

      ) : (

        <div
          className="
          col-span-full
          rounded-[32px]
          border
          border-dashed
          border-slate-300
          bg-white
          py-24
          text-center
          shadow-sm
          "
        >

          <Bell
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-6 text-2xl font-black text-slate-700">

            لا توجد إشعارات

          </h2>

          <p className="mt-3 text-slate-500">

            لم يتم إرسال أي إشعار حتى الآن.

          </p>

        </div>

      )}

    </div>

  );

}

/* ============================================================
   NotificationTabs
   ============================================================ */

type NotificationTabsProps = {
  tab: string;
  setTab: (v: any) => void;
};

export function NotificationTabs({

tab,

setTab,

}: NotificationTabsProps){

const tabs=[

{
id:"all",
label:"الكل",
},

{
id:"today",
label:"اليوم",
},

{
id:"lecture",
label:"المحاضرات",
},

{
id:"homework",
label:"الواجبات",
},

{
id:"exam",
label:"الامتحانات",
},

];

return(

<div className="mt-8 flex flex-wrap gap-3">

{tabs.map((item)=>(

<button

key={item.id}

onClick={()=>setTab(item.id)}

className={`
rounded-2xl
px-6
py-3
font-semibold
transition-all
duration-300

${
tab===item.id

?

"bg-[#1E1B3A] text-white shadow-lg"

:

"bg-white border border-slate-200 text-slate-600 hover:border-[#1E1B3A]/30 hover:text-[#1E1B3A]"

}

`}

>

{item.label}

</button>

))}

</div>

);

}
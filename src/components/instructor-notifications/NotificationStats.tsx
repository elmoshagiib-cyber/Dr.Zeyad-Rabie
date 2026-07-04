import {
  Bell,
  CalendarDays,
  EyeOff,
  GraduationCap,
} from "lucide-react";

type Props = {
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
}: Props) {

  const stats = [

    {
      title: "إجمالي الإشعارات",
      value: total,
      icon: Bell,
      color: "bg-violet-100 text-violet-700",
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
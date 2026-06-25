import {
Search,
CheckCircle2,
Clock3,
XCircle,
ShieldCheck
} from "lucide-react";

const students=[
{
id:1,
name:"أحمد محمد",
status:"present"
},
{
id:2,
name:"محمد خالد",
status:"late"
},
{
id:3,
name:"يوسف أحمد",
status:"absent"
},
{
id:4,
name:"عمر علي",
status:"excused"
}
];

export function AttendanceTable(){

return(

<div className="bg-white rounded-[32px] border border-slate-200 shadow-lg p-6">

<div className="flex items-center justify-between mb-6">

<div>

<h2 className="text-2xl font-black">

قائمة الحضور

</h2>

<p className="text-slate-500">

جميع الطلاب داخل الجلسة

</p>

</div>

<div className="relative">

<Search
size={18}
className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
/>

<input
placeholder="بحث..."
className="
w-72
rounded-xl
border
border-slate-200
pr-11
py-3
outline-none
focus:ring-4
focus:ring-blue-100
"
/>

</div>

</div>

<table className="w-full">

<thead>

<tr className="text-slate-500 border-b">

<th className="py-4 text-right">الطالب</th>

<th>الحالة</th>

<th>آخر تحديث</th>

<th></th>

</tr>

</thead>

<tbody>

{students.map(student=>(

<tr
key={student.id}
className="border-b hover:bg-slate-50 transition-all"
>

<td className="py-5 font-semibold">

{student.name}

</td>

<td>

{student.status==="present"&&(
<span className="px-4 py-2 rounded-full bg-green-100 text-green-700">
حاضر
</span>
)}

{student.status==="late"&&(
<span className="px-4 py-2 rounded-full bg-orange-100 text-orange-700">
متأخر
</span>
)}

{student.status==="absent"&&(
<span className="px-4 py-2 rounded-full bg-red-100 text-red-700">
غائب
</span>
)}

{student.status==="excused"&&(
<span className="px-4 py-2 rounded-full bg-blue-100 text-blue-700">
بعذر
</span>
)}

</td>

<td>

09:20

</td>

<td>

<div className="flex gap-2 justify-end">

<button>

<CheckCircle2
size={18}
className="text-green-600"
/>

</button>

<button>

<Clock3
size={18}
className="text-orange-600"
/>

</button>

<button>

<ShieldCheck
size={18}
className="text-blue-600"
/>

</button>

<button>

<XCircle
size={18}
className="text-red-600"
/>

</button>

</div>

</td>

</tr>

))}

</tbody>

</table>

</div>

);

}
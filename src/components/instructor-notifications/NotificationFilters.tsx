import {
  Search,
  RotateCcw,
} from "lucide-react";

type Props = {
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

}: Props) {

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
focus:border-violet-600
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
border-violet-200
px-5
py-3
font-semibold
text-violet-700
transition
hover:bg-violet-50
"

>

<RotateCcw size={18}/>

إعادة التعيين

</button>

</div>

);

}
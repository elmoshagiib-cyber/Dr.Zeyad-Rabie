type Props = {

tab:string;

setTab:(v:any)=>void;

};

export function NotificationTabs({

tab,

setTab,

}:Props){

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

"bg-[#4C1D95] text-white shadow-lg"

:

"bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-700"

}

`}

>

{item.label}

</button>

))}

</div>

);

}
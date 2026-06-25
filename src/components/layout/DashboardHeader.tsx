import {
Bell,
User,
Settings,
LockKeyhole,
LogOut
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";

export function DashboardHeader() {

const { user, logout } = useApp();

const navigate = useNavigate();

const [profileOpen,setProfileOpen]=useState(false);

return (

<div className="flex items-center justify-between mb-8">

<div>


</div>

<div className="relative flex items-center gap-3">

<button className="w-11 h-11 rounded-xl bg-white border shadow-sm hover:bg-slate-50 transition">

<Bell size={20}/>

</button>

<button

onClick={()=>setProfileOpen(!profileOpen)}

className="relative"

>

<div className="
w-12
h-12
rounded-full
bg-gradient-to-br
from-violet-600
to-indigo-500
flex
items-center
justify-center
text-white
font-bold
ring-2
ring-violet-500
">

{user?.name?.charAt(0)}

<span className="
absolute
bottom-0
right-0
w-3
h-3
rounded-full
bg-emerald-500
border-2
border-white
"/>

</div>

</button>

</div>

</div>

);

}
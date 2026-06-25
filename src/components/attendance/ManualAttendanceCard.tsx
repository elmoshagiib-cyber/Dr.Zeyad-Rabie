import { useState } from "react";
import {
    Search,
    User,
    CheckCircle2,
    Clock3,
    XCircle,
    ShieldCheck,
    Save,
} from "lucide-react";

export function ManualAttendanceCard() {

    const [selected, setSelected] = useState("present");

    const buttons = [
        {
            id: "present",
            label: "حاضر",
            icon: CheckCircle2,
            color: "green"
        },
        {
            id: "late",
            label: "متأخر",
            icon: Clock3,
            color: "orange"
        },
        {
            id: "absent",
            label: "غائب",
            icon: XCircle,
            color: "red"
        },
        {
            id: "excused",
            label: "بعذر",
            icon: ShieldCheck,
            color: "blue"
        }
    ];

    return (

        <div className="bg-white rounded-[32px] border border-slate-200 shadow-lg p-6">

            <h2 className="text-2xl font-black text-slate-900">

                تسجيل يدوي

            </h2>

            <p className="text-slate-500 mt-2">

                ابحث عن الطالب ثم اختر حالة الحضور.

            </p>

            {/* Search */}

            <div className="relative mt-6">

                <Search
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                />

                <input
                    placeholder="ابحث باسم الطالب أو الكود..."
                    className="
                    w-full
                    rounded-2xl
                    border
                    border-slate-200
                    py-4
                    pr-12
                    pl-4
                    outline-none
                    focus:ring-4
                    focus:ring-blue-100
                    "
                />

            </div>

            {/* Student */}

            <div className="mt-6 rounded-2xl border border-slate-200 p-4 flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">

                    <User className="text-blue-600"/>

                </div>

                <div>

                    <h3 className="font-bold">

                        أحمد محمد

                    </h3>

                    <p className="text-sm text-slate-500">

                        كود : ST1025

                    </p>

                </div>

            </div>

            {/* Status */}

            <div className="grid grid-cols-2 gap-3 mt-6">

                {buttons.map((btn)=>{

                    const Icon=btn.icon;

                    return(

                        <button

                            key={btn.id}

                            onClick={()=>setSelected(btn.id)}

                            className={`
                            rounded-2xl
                            border
                            p-4
                            transition-all
                            duration-300
                            flex
                            items-center
                            justify-center
                            gap-2

                            ${
                                selected===btn.id
                                ? "border-blue-500 bg-blue-50 shadow"
                                :"border-slate-200 hover:border-blue-300"
                            }
                            `}
                        >

                            <Icon size={20}/>

                            {btn.label}

                        </button>

                    )

                })}

            </div>

            {/* Notes */}

            <textarea

                placeholder="ملاحظات..."

                rows={4}

                className="
                mt-6
                w-full
                rounded-2xl
                border
                border-slate-200
                p-4
                outline-none
                resize-none
                focus:ring-4
                focus:ring-blue-100
                "

            />

            <button

                className="
                mt-6
                w-full
                rounded-2xl
                bg-blue-600
                hover:bg-blue-700
                text-white
                py-4
                font-bold
                flex
                justify-center
                items-center
                gap-2
                transition-all
                "

            >

                <Save size={18}/>

                حفظ الحضور

            </button>

        </div>

    );

}
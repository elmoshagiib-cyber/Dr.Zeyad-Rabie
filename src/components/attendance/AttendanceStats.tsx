import {
    Users,
    CheckCircle2,
    Clock3,
    XCircle
} from "lucide-react";

const cards = [
    {
        title: "إجمالي الطلاب",
        value: 352,
        icon: Users,
        color: "blue",
        note: "+12 هذا الأسبوع"
    },
    {
        title: "الحاضرون",
        value: 287,
        icon: CheckCircle2,
        color: "green",
        note: "81%"
    },
    {
        title: "المتأخرون",
        value: 18,
        icon: Clock3,
        color: "orange",
        note: "5%"
    },
    {
        title: "الغائبون",
        value: 47,
        icon: XCircle,
        color: "red",
        note: "13%"
    }
];

export function AttendanceStats() {
    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

            {cards.map((card) => {

                const Icon = card.icon;

                return (

                    <div
                        key={card.title}
                        className="bg-white rounded-[28px] border border-slate-200 p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >

                        <div className="flex justify-between items-center">

                            <div>

                                <p className="text-slate-500 text-sm">

                                    {card.title}

                                </p>

                                <h2 className="text-4xl font-black mt-3">

                                    {card.value}

                                </h2>

                                <span className="text-xs text-slate-400 mt-2 block">

                                    {card.note}

                                </span>

                            </div>

                            <div
                                className={`
                                w-16
                                h-16
                                rounded-2xl
                                flex
                                items-center
                                justify-center

                                ${card.color === "blue" && "bg-blue-100 text-blue-600"}
                                ${card.color === "green" && "bg-green-100 text-green-600"}
                                ${card.color === "orange" && "bg-orange-100 text-orange-600"}
                                ${card.color === "red" && "bg-red-100 text-red-600"}
                                `}
                            >

                                <Icon size={30} />

                            </div>

                        </div>

                    </div>

                );

            })}

        </div>

    );
}
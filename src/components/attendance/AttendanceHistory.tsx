import {
    CalendarDays,
    ChevronLeft,
    Users,
    CheckCircle2,
} from "lucide-react";

const sessions = [
    {
        week: "الأسبوع الأول",
        date: "1 يونيو",
        attendance: "92%",
        students: 41,
    },
    {
        week: "الأسبوع الثاني",
        date: "8 يونيو",
        attendance: "89%",
        students: 39,
    },
    {
        week: "الأسبوع الثالث",
        date: "15 يونيو",
        attendance: "95%",
        students: 43,
    },
    {
        week: "الأسبوع الرابع",
        date: "22 يونيو",
        attendance: "81%",
        students: 35,
        active: true,
    },
];

export function AttendanceHistory() {
    return (
        <div className="bg-white rounded-[32px] border border-slate-200 shadow-lg p-6">

            <div className="flex items-center justify-between mb-6">

                <div>

                    <h2 className="text-2xl font-black">
                        سجل الجلسات
                    </h2>

                    <p className="text-slate-500">
                        آخر جلسات الحضور
                    </p>

                </div>

                <CalendarDays className="text-blue-600" size={28} />

            </div>

            <div className="space-y-4">

                {sessions.map((session) => (

                    <div
                        key={session.week}
                        className={`
                        rounded-2xl
                        border
                        p-4
                        transition-all
                        cursor-pointer

                        ${
                            session.active
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                        }
                        `}
                    >

                        <div className="flex items-center justify-between">

                            <ChevronLeft className="text-slate-400" />

                            <div className="text-right">

                                <h3 className="font-bold">

                                    {session.week}

                                </h3>

                                <p className="text-sm text-slate-500">

                                    {session.date}

                                </p>

                            </div>

                        </div>

                        <div className="mt-5">

                            <div className="flex justify-between text-sm">

                                <span className="text-green-600 font-bold">

                                    {session.attendance}

                                </span>

                                <span className="text-slate-500">

                                    نسبة الحضور

                                </span>

                            </div>

                            <div className="mt-2 h-2 rounded-full bg-slate-100">

                                <div
                                    className="h-full rounded-full bg-green-500"
                                    style={{
                                        width: session.attendance,
                                    }}
                                />

                            </div>

                        </div>

                        <div className="flex justify-between mt-5">

                            <div className="flex items-center gap-2 text-slate-500">

                                <Users size={16} />

                                {session.students}

                            </div>

                            <CheckCircle2
                                className="text-green-600"
                                size={18}
                            />

                        </div>

                    </div>

                ))}

            </div>

        </div>
    );
}
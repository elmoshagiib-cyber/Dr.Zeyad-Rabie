import { AttendanceHero } from "../../components/attendance/AttendanceHero";
import { AttendanceStats } from "../../components/attendance/AttendanceStats";
import { ActiveSessionCard } from "../../components/attendance/ActiveSessionCard";
import { ManualAttendanceCard } from "../../components/attendance/ManualAttendanceCard";
import { AttendanceTable } from "../../components/attendance/AttendanceTable";
import { AttendanceHistory } from "../../components/attendance/AttendanceHistory";
import { useEffect, useState } from "react";
import {
    createAttendanceSession,
    getActiveAttendanceSession,
} from "../../services/attendanceService";

import { generateQrToken } from "../../utils/generateQrToken";

export function InstructorAttendance() {
  const [session, setSession] = useState<any>(null);

const loadSession = async () => {
    const data = await getActiveAttendanceSession();
    setSession(data);
};

useEffect(() => {
    loadSession();
}, []);

const handleCreateSession = async () => {

    const now = new Date();

    const end = new Date(now.getTime() + 60 * 60 * 1000);

    const late = new Date(now.getTime() + 15 * 60 * 1000);

    const newSession = await createAttendanceSession({

        title: "الأسبوع الرابع",

        grade: "third_sec",

        course_id: null,

        qr_token: generateQrToken(),

        start_time: now,

        end_time: end,

        late_after: late,

        qr_rotating: true,

        status: "active",

        is_active: true,

        created_by: null

    });

    setSession(newSession);

};
  return (
    <div className="space-y-8">

      <AttendanceHero

    onCreateSession={handleCreateSession}

    activeSession={!!session}

/>

      <AttendanceStats />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <ActiveSessionCard />

        <ManualAttendanceCard />

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        <div className="xl:col-span-2">
          <AttendanceTable />
        </div>

        <AttendanceHistory />

      </div>

    </div>
  );
}
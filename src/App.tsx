import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { HomePage } from "./pages/HomePage";
import { MaintenanceMode } from "./components/MaintenanceMode";

// غيّر true/false هنا عشان تشغّل أو توقف وضع الصيانة
const MAINTENANCE_MODE = true;

import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ThemeProvider } from "./context/ThemeContext";
import { InstructorHomeworkSubmissions } from "./pages/instructor/InstructorHomeworkSubmissions";
import StudentLoginPage from "./pages/StudentLoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import StudentRegisterPage from "./pages/StudentRegisterPage";
import GradesPage from "./pages/student/GradesPage";
import { StaffLoginPage } from "./pages/StaffLoginPage";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
/* Student */
import { StudentDashboard } from "./pages/student/StudentDashboard";
import { LessonPlayer } from "./pages/student/LessonPlayer";
import { QuizPage } from "./pages/student/QuizPage";
import { AnnouncementsPage } from "./pages/student/AnnouncementsPage";
import { ProfilePage } from "./pages/student/ProfilePage";
import { LeaderboardPage } from "./pages/student/LeaderboardPage";
import { MyCoursesPage } from "./pages/student/MyCourses";
import { HomeworkPage } from "./pages/student/HomeworkPage";
import { ExamsPage } from "./pages/student/ExamsPage";
import GradeCoursesPage from "./pages/GradeCoursesPage";

/* Instructor */
import { InstructorDashboard } from "./pages/instructor/InstructorDashboard";
import { InstructorCourses } from "./pages/instructor/InstructorCourses";
import { CreateCourse } from "./pages/instructor/CreateCourse";
import { InstructorStudents } from "./pages/instructor/InstructorStudents";
import InstructorNotifications from "./pages/instructor/InstructorNotifications";

import { StudentDetails } from "./pages/instructor/StudentDetails";
import { EditStudent } from "./pages/instructor/EditStudent";
import { EditCourse } from "./pages/instructor/EditCourse";
import SubscriptionCodes from "./pages/instructor/SubscriptionCodes";
import { HomeworkDetailsPage } from "./pages/student/HomeworkDetailsPage";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
/* Admin */
import { AdminDashboard } from "./pages/admin/AdminDashboard";

function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: string[];
}) {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        جاري التحميل...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function DomainRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const host = window.location.hostname;

    const isAdminDomain = host === "admin.zeyadrabie.com";
    const isMainDomain =
      host === "zeyadrabie.com" ||
      host === "www.zeyadrabie.com" ||
      host === "dr-zeyad-rabie.vercel.app";

    if (
  isAdminDomain &&
  (location.pathname === "/" || location.pathname === "/index.html")
) {
      navigate("/staff-login", { replace: true });
      return;
    }

    if (isMainDomain && location.pathname === "/staff-login") {
      window.location.replace(
        "https://admin.zeyadrabie.com/staff-login"
      );
      return;
    }
  }, [location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomePage />} />
<Route path="/courses/:slug" element={<CourseDetailPage />} />

<Route path="/staff-login" element={<StaffLoginPage />} />
     <Route
  path="/login"
  element={<StudentLoginPage />}
/>

<Route
  path="/register"
  element={<StudentRegisterPage />}
/>

<Route
  path="/reset-password"
  element={<ResetPasswordPage />}
/>

            {/* Student */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["student"]}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

<Route
  path="/dashboard/homework/:id"
  element={
    <ProtectedRoute roles={["student"]}>
      <HomeworkDetailsPage />
    </ProtectedRoute>
  }
/>

      <Route
        path="/dashboard/courses"
        element={
          <ProtectedRoute roles={["student"]}>
            <MyCoursesPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/homework"
        element={
          <ProtectedRoute roles={["student"]}>
            <HomeworkPage />
          </ProtectedRoute>
        }
      />

     <Route
  path="/dashboard/exams"
  element={
    <ProtectedRoute roles={["student"]}>
      <ExamsPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/staff-login"
  element={<StaffLoginPage />}
/>
      <Route
        path="/dashboard/lesson/:id"
        element={
          <ProtectedRoute roles={["student"]}>
            <LessonPlayer />
          </ProtectedRoute>
        }
      />

      <Route
  path="/dashboard/exams/:id"
  element={
    <ProtectedRoute roles={["student"]}>
      <QuizPage />
    </ProtectedRoute>
  }
/>

      <Route
        path="/dashboard/announcements"
        element={
          <ProtectedRoute roles={["student"]}>
            <AnnouncementsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/leaderboard"
        element={
          <ProtectedRoute roles={["student"]}>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
<Route
  path="/grade/:grade"
  element={<GradeCoursesPage />}
/>

<Route
  path="/stage/:stage"
  element={<GradesPage />}
/>

      {/* Instructor */}

      <Route
        path="/instructor"
        element={
          <ProtectedRoute roles={["instructor"]}>
            <InstructorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses"
        element={
          <ProtectedRoute roles={["instructor"]}>
            <InstructorCourses />
          </ProtectedRoute>
        }
      />

      <Route
  path="/instructor/courses/create"
  element={
    <ProtectedRoute roles={["instructor"]}>
      <CreateCourse />
    </ProtectedRoute>
  }
/>

      <Route
        path="/instructor/students"
        element={
          <ProtectedRoute roles={["instructor"]}>
            <InstructorStudents />
          </ProtectedRoute>
        }
      />
      <Route
  path="/instructor/students/edit/:id"
  element={
    <ProtectedRoute roles={["instructor"]}>
      <EditStudent />
    </ProtectedRoute>
  }
/>
<Route
  path="/instructor/students/:id"
  element={
    <ProtectedRoute roles={["instructor"]}>
      <StudentDetails />
    </ProtectedRoute>
  }
/>
      
      <Route
  path="/instructor/submissions"
  element={
    <ProtectedRoute roles={["instructor"]}>
      <InstructorHomeworkSubmissions />
    </ProtectedRoute>
  }
/>

      <Route
        path="/instructor/notifications"
        element={
          <ProtectedRoute roles={["instructor"]}>
            <InstructorNotifications />
          </ProtectedRoute>
        }
      />


<Route
  path="/instructor/courses/edit/:id"
  element={
    <ProtectedRoute roles={["instructor"]}>
      <EditCourse />
    </ProtectedRoute>
  }
/>

<Route
    path="/instructor/subscription-codes"
    element={<SubscriptionCodes />}
/>
      {/* Admin */}

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />


      {/* Fallback */}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
<main className="pt-[80px]"></main>
export default function App() {

  if (MAINTENANCE_MODE) {
    return <MaintenanceMode />;
  }

  return (
    <AppProvider>

      <ThemeProvider>
       <BrowserRouter>
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 4000,
      style: {
        direction: "rtl",
        borderRadius: "16px",
        background: "#ffffff",
        color: "#111827",
        fontWeight: 600,
        boxShadow: "0 15px 40px rgba(0,0,0,.12)",
      },
      success: {
        iconTheme: {
          primary: "#B348FE",
          secondary: "#ffffff",
        },
      },
      error: {
        iconTheme: {
          primary: "#EF4444",
          secondary: "#ffffff",
        },
      },
    }}
  />

<DomainRedirect />

<div className="overflow-x-hidden w-full">
  <AppRoutes />
</div>

</BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  );
}
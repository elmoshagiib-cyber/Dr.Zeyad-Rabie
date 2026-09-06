import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { MaintenanceMode } from "./components/shared/MaintenanceMode";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";
import { useVisitTracker } from "./hooks/useVisitTracker";
import StudentLayout from "./components/layout/student-dashboard/StudentLayout";

// غيّر true/false هنا عشان تشغّل أو توقف وضع الصيانة
const MAINTENANCE_MODE = false;

// ============================================================
// LAZY-LOADED PAGES (Code Splitting)
// كل صفحة بقت بتتحمل بس لما المستخدم يفتحها فعليًا،
// مش كلهم مع بعض في الـ bundle الرئيسي من أول ما الموقع يفتح.
// ============================================================

/* Home */
const HomePage = lazy(() =>
  import("./pages/home/HomePage").then((m) => ({ default: m.HomePage }))
);
const CourseDetailPage = lazy(() =>
  import("./pages/home/CourseDetailPage").then((m) => ({ default: m.CourseDetailPage }))
);
const GradesPage = lazy(() => import("./pages/home/GradesPage"));
const GradeCoursesPage = lazy(() => import("./pages/home/GradeCoursesPage"));

/* Auth */
const StudentLoginPage = lazy(() => import("./pages/auth/StudentLoginPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const StudentRegisterPage = lazy(() => import("./pages/auth/StudentRegisterPage"));
const StaffLoginPage = lazy(() =>
  import("./pages/auth/StaffLoginPage").then((m) => ({ default: m.StaffLoginPage }))
);

/* Parent */
const ParentDashboardPage = lazy(() => import("./pages/parent/ParentDashboardPage"));

/* Student */
const LessonPlayer = lazy(() =>
  import("./pages/student/LessonPlayer").then((m) => ({ default: m.LessonPlayer }))
);
const QuizPage = lazy(() =>
  import("./pages/student/QuizPage").then((m) => ({ default: m.QuizPage }))
);
const AnnouncementsPage = lazy(() =>
  import("./pages/student/AnnouncementsPage").then((m) => ({ default: m.AnnouncementsPage }))
);
const ProfilePage = lazy(() =>
  import("./pages/student/ProfilePage").then((m) => ({ default: m.ProfilePage }))
);
const LeaderboardPage = lazy(() =>
  import("./pages/student/LeaderboardPage").then((m) => ({ default: m.LeaderboardPage }))
);
const MyCoursesPage = lazy(() =>
  import("./pages/student/MyCourses").then((m) => ({ default: m.MyCoursesPage }))
);
const HomeworkPage = lazy(() =>
  import("./pages/student/HomeworkPage").then((m) => ({ default: m.HomeworkPage }))
);
const ExamsPage = lazy(() =>
  import("./pages/student/ExamsPage").then((m) => ({ default: m.ExamsPage }))
);
const ForumPage = lazy(() => import("./pages/student/ForumPage"));
const DashboardHomePage = lazy(() => import("./pages/student/DashboardHomePage"));
const MyMistakesPage = lazy(() =>
  import("./pages/student/MyMistakesPage").then((m) => ({ default: m.MyMistakesPage }))
);
const MistakesReviewQuizPage = lazy(() =>
  import("./pages/student/MistakesReviewQuizPage").then((m) => ({
    default: m.MistakesReviewQuizPage,
  }))
);
const HomeworkDetailsPage = lazy(() =>
  import("./pages/student/HomeworkDetailsPage").then((m) => ({
    default: m.HomeworkDetailsPage,
  }))
);

/* Instructor */
const InstructorDashboard = lazy(() =>
  import("./pages/instructor/InstructorDashboard").then((m) => ({
    default: m.InstructorDashboard,
  }))
);
const InstructorCourses = lazy(() =>
  import("./pages/instructor/InstructorCourses").then((m) => ({
    default: m.InstructorCourses,
  }))
);
const CreateCourse = lazy(() =>
  import("./pages/instructor/CreateCourse").then((m) => ({ default: m.CreateCourse }))
);
const InstructorStudents = lazy(() =>
  import("./pages/instructor/InstructorStudents").then((m) => ({
    default: m.InstructorStudents,
  }))
);
const InstructorNotifications = lazy(() => import("./pages/instructor/InstructorNotifications"));
const InstructorHomeworkSubmissions = lazy(() =>
  import("./pages/instructor/InstructorHomeworkSubmissions").then((m) => ({
    default: m.InstructorHomeworkSubmissions,
  }))
);
const StudentDetails = lazy(() =>
  import("./pages/instructor/StudentDetails").then((m) => ({ default: m.StudentDetails }))
);
const EditStudent = lazy(() =>
  import("./pages/instructor/EditStudent").then((m) => ({ default: m.EditStudent }))
);
const EditCourse = lazy(() =>
  import("./pages/instructor/EditCourse").then((m) => ({ default: m.EditCourse }))
);
const SubscriptionCodes = lazy(() => import("./pages/instructor/SubscriptionCodes"));
const InstructorReports = lazy(() =>
  import("./pages/instructor/InstructorReports").then((m) => ({
    default: m.InstructorReports,
  }))
);
const InstructorWatchProgress = lazy(() =>
  import("./pages/instructor/InstructorWatchProgress").then((m) => ({
    default: m.InstructorWatchProgress,
  }))
);

// ============================================================
// شاشة تحميل بسيطة تظهر لحد ما الصفحة المطلوبة تحمل
// ============================================================
function PageLoader() {
  return (
    <div className="h-screen flex items-center justify-center bg-white dark:bg-[#09090B]">
      <div className="w-10 h-10 border-4 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

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

function VisitTracker() {
  useVisitTracker();
  return null;
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
      window.location.replace("https://admin.zeyadrabie.com/staff-login");
      return;
    }
  }, [location.pathname, navigate]);

  return null;
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />

        <Route path="/staff-login" element={<StaffLoginPage />} />
        <Route path="/parent-dashboard" element={<ParentDashboardPage />} />
        <Route path="/login" element={<StudentLoginPage />} />

        <Route path="/register" element={<StudentRegisterPage />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Student */}
        <Route
          path="/dashboard"
          element={<Navigate to="/dashboard/courses" replace />}
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
        <Route path="/staff-login" element={<StaffLoginPage />} />
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
          path="/dashboard/forum"
          element={
            <ProtectedRoute roles={["student"]}>
              <StudentLayout>
                <ForumPage />
              </StudentLayout>
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
          path="/dashboard/mistakes"
          element={
            <ProtectedRoute roles={["student"]}>
              <MyMistakesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/mistakes-review"
          element={
            <ProtectedRoute roles={["student"]}>
              <MistakesReviewQuizPage />
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
        <Route path="/grade/:grade" element={<GradeCoursesPage />} />

        <Route path="/stage/:stage" element={<GradesPage />} />

        <Route
          path="/dashboard/home"
          element={
            <ProtectedRoute roles={["student"]}>
              <DashboardHomePage />
            </ProtectedRoute>
          }
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

        <Route path="/instructor/subscription-codes" element={<SubscriptionCodes />} />

        <Route
          path="/instructor/reports"
          element={
            <ProtectedRoute roles={["instructor"]}>
              <InstructorReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/instructor/watch-progress"
          element={
            <ProtectedRoute roles={["instructor"]}>
              <InstructorWatchProgress />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

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
          <VisitTracker />

          <div className="overflow-x-hidden w-full">
            <AppRoutes />
          </div>
        </BrowserRouter>
      </ThemeProvider>
    </AppProvider>
  );
}
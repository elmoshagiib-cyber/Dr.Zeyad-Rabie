import {
  Student,
  Course,
  Lesson,
  Exam,
  Subscription,
  AccessCode,
  Payment,
  Notification,
  DashboardStats,
  Activity,
  RevenueChartData,
  StudentGrowthData,
  CoursePerformanceData,
  Instructor,
  ExamAttempt,
  SubscriptionPlan,
} from '../types';

// Instructors
export const instructors: Instructor[] = [
  { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', coursesCount: 5, avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'فاطمة علي', email: 'fatima@example.com', coursesCount: 3, avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'محمد حسن', email: 'mohamed@example.com', coursesCount: 4, avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'سارة أحمد', email: 'sara@example.com', coursesCount: 2, avatar: 'https://i.pravatar.cc/150?u=4' },
];

// Students
export const students: Student[] = [
  { id: '1', name: 'عمر خالد', email: 'omar@example.com', phone: '0501234567', grade: 'الثانوية الأولى', enrolledCourses: ['1', '2'], progress: 75, totalExams: 12, averageScore: 88, lastActivity: '2026-01-15', status: 'active', createdAt: '2025-09-01' },
  { id: '2', name: 'ليلى محمود', email: 'layla@example.com', phone: '0502345678', grade: 'الثانوية الثانية', enrolledCourses: ['1', '3'], progress: 60, totalExams: 8, averageScore: 92, lastActivity: '2026-01-14', status: 'active', createdAt: '2025-09-05' },
  { id: '3', name: 'يوسف إبراهيم', email: 'youssef@example.com', phone: '0503456789', grade: 'الثانوية الثالثة', enrolledCourses: ['2', '4'], progress: 85, totalExams: 15, averageScore: 95, lastActivity: '2026-01-15', status: 'active', createdAt: '2025-08-20' },
  { id: '4', name: 'نور سعيد', email: 'noor@example.com', phone: '0504567890', grade: 'الثانوية الأولى', enrolledCourses: ['1'], progress: 45, totalExams: 5, averageScore: 78, lastActivity: '2026-01-10', status: 'active', createdAt: '2025-10-01' },
  { id: '5', name: 'كريم عبدالله', email: 'karim@example.com', phone: '0505678901', grade: 'الثانوية الثانية', enrolledCourses: ['3', '4'], progress: 90, totalExams: 18, averageScore: 97, lastActivity: '2026-01-15', status: 'active', createdAt: '2025-08-15' },
  { id: '6', name: 'مريم حسن', email: 'mariam@example.com', phone: '0506789012', grade: 'الثانوية الثالثة', enrolledCourses: ['2'], progress: 30, totalExams: 3, averageScore: 65, lastActivity: '2026-01-08', status: 'inactive', createdAt: '2025-11-01' },
  { id: '7', name: 'علي رضا', email: 'ali@example.com', phone: '0507890123', grade: 'الثانوية الأولى', enrolledCourses: ['1', '2', '3'], progress: 70, totalExams: 10, averageScore: 85, lastActivity: '2026-01-14', status: 'active', createdAt: '2025-09-10' },
  { id: '8', name: 'هدى طارق', email: 'huda@example.com', phone: '0508901234', grade: 'الثانوية الثانية', enrolledCourses: ['4'], progress: 55, totalExams: 7, averageScore: 82, lastActivity: '2026-01-12', status: 'active', createdAt: '2025-09-20' },
];

// Courses
export const courses: Course[] = [
  { id: '1', title: 'الرياضيات المتقدمة', description: 'دورة شاملة في الرياضيات للثانوية العامة', thumbnail: 'https://picsum.photos/seed/math/400/250', instructor: instructors[0], grade: 'الثانوية الثالثة', subject: 'الرياضيات', studentsCount: 156, lessonsCount: 24, examsCount: 8, revenue: 45000, completionRate: 78, status: 'published', price: 299, duration: '3 أشهر', createdAt: '2025-08-01', updatedAt: '2026-01-10' },
  { id: '2', title: 'الفيزياء الحديثة', description: 'أساسيات الفيزياء والتطبيقات العملية', thumbnail: 'https://picsum.photos/seed/physics/400/250', instructor: instructors[1], grade: 'الثانوية الثالثة', subject: 'الفيزياء', studentsCount: 132, lessonsCount: 20, examsCount: 6, revenue: 38000, completionRate: 72, status: 'published', price: 299, duration: '3 أشهر', createdAt: '2025-08-15', updatedAt: '2026-01-08' },
  { id: '3', title: 'الكيمياء العضوية', description: 'دراسة متعمقة للكيمياء العضوية', thumbnail: 'https://picsum.photos/seed/chemistry/400/250', instructor: instructors[2], grade: 'الثانوية الثانية', subject: 'الكيمياء', studentsCount: 98, lessonsCount: 18, examsCount: 5, revenue: 28000, completionRate: 65, status: 'published', price: 249, duration: '2.5 أشهر', createdAt: '2025-09-01', updatedAt: '2026-01-05' },
  { id: '4', title: 'الأحياء والعلوم', description: 'دورة شاملة في علم الأحياء', thumbnail: 'https://picsum.photos/seed/biology/400/250', instructor: instructors[3], grade: 'الثانوية الأولى', subject: 'الأحياء', studentsCount: 145, lessonsCount: 22, examsCount: 7, revenue: 42000, completionRate: 80, status: 'published', price: 279, duration: '3 أشهر', createdAt: '2025-08-20', updatedAt: '2026-01-12' },
  { id: '5', title: 'اللغة العربية', description: 'قواعد اللغة العربية والبلاغة', thumbnail: 'https://picsum.photos/seed/arabic/400/250', instructor: instructors[0], grade: 'الثانوية الثالثة', subject: 'اللغة العربية', studentsCount: 189, lessonsCount: 16, examsCount: 4, revenue: 52000, completionRate: 85, status: 'published', price: 199, duration: '2 أشهر', createdAt: '2025-07-15', updatedAt: '2026-01-14' },
  { id: '6', title: 'اللغة الإنجليزية', description: 'تطوير مهارات اللغة الإنجليزية', thumbnail: 'https://picsum.photos/seed/english/400/250', instructor: instructors[1], grade: 'الثانوية الثانية', subject: 'اللغة الإنجليزية', studentsCount: 210, lessonsCount: 25, examsCount: 8, revenue: 58000, completionRate: 82, status: 'published', price: 249, duration: '3 أشهر', createdAt: '2025-07-01', updatedAt: '2026-01-15' },
];

// Lessons
export const lessons: Lesson[] = [
  { id: '1', courseId: '1', title: 'المعادلات التفاضلية', description: 'مقدمة في المعادلات التفاضلية', type: 'video', duration: '45:30', videoUrl: 'https://example.com/video1', order: 1, views: 234, completionRate: 85, averageWatchTime: '38:20', status: 'published', createdAt: '2025-08-01' },
  { id: '2', courseId: '1', title: 'التكامل والتفاضل', description: 'أساسيات التكامل والتفاضل', type: 'video', duration: '52:15', videoUrl: 'https://example.com/video2', order: 2, views: 198, completionRate: 78, averageWatchTime: '42:10', status: 'published', createdAt: '2025-08-03' },
  { id: '3', courseId: '1', title: 'ملخص الدرس الأول', description: 'ملخص PDF للمعادلات التفاضلية', type: 'pdf', pdfUrl: 'https://example.com/pdf1', order: 3, views: 156, completionRate: 92, status: 'published', createdAt: '2025-08-05' },
  { id: '4', courseId: '2', title: 'قوانين نيوتن', description: 'شرح قوانين نيوتن للحركة', type: 'video', duration: '48:00', videoUrl: 'https://example.com/video3', order: 1, views: 187, completionRate: 80, averageWatchTime: '40:30', status: 'published', createdAt: '2025-08-15' },
  { id: '5', courseId: '2', title: 'واجب عملي', description: 'تطبيق قوانين نيوتن', type: 'homework', order: 2, views: 145, completionRate: 65, status: 'published', createdAt: '2025-08-17' },
  { id: '6', courseId: '3', title: 'المركبات العضوية', description: 'أنواع المركبات العضوية', type: 'video', duration: '55:20', videoUrl: 'https://example.com/video4', order: 1, views: 167, completionRate: 75, averageWatchTime: '45:00', status: 'published', createdAt: '2025-09-01' },
];

// Exams
export const exams: Exam[] = [
  { id: '1', courseId: '1', title: 'اختبار المعادلات التفاضلية', description: 'اختبار شامل على المعادلات التفاضلية', duration: 60, totalQuestions: 20, passingScore: 60, attempts: [85, 72, 90, 68, 95], averageScore: 82, passRate: 88, status: 'active', scheduledDate: '2026-01-20', questions: [], createdAt: '2025-08-10' },
  { id: '2', courseId: '1', title: 'اختبار التكامل', description: 'اختبار على التكامل والتفاضل', duration: 45, totalQuestions: 15, passingScore: 60, attempts: [78, 65, 88, 70, 92], averageScore: 78, passRate: 85, status: 'active', scheduledDate: '2026-01-25', questions: [], createdAt: '2025-08-20' },
  { id: '3', courseId: '2', title: 'اختبار قوانين الحركة', description: 'اختبار على قوانين نيوتن', duration: 50, totalQuestions: 18, passingScore: 65, attempts: [80, 75, 85, 70, 88], averageScore: 79, passRate: 90, status: 'active', scheduledDate: '2026-01-22', questions: [], createdAt: '2025-08-25' },
  { id: '4', courseId: '3', title: 'اختبار الكيمياء العضوية', description: 'اختبار شامل', duration: 60, totalQuestions: 25, passingScore: 60, attempts: [72, 68, 82, 75, 90], averageScore: 77, passRate: 82, status: 'active', scheduledDate: '2026-01-28', questions: [], createdAt: '2025-09-05' },
  { id: '5', courseId: '4', title: 'اختبار الأحياء', description: 'اختبار على الخلية والوراثة', duration: 55, totalQuestions: 22, passingScore: 60, attempts: [88, 82, 90, 85, 95], averageScore: 88, passRate: 95, status: 'active', scheduledDate: '2026-01-30', questions: [], createdAt: '2025-09-10' },
];

// Exam Attempts
export const examAttempts: ExamAttempt[] = [
  { id: '1', examId: '1', studentId: '1', studentName: 'عمر خالد', score: 85, totalPoints: 100, percentage: 85, status: 'passed', answers: [], submittedAt: '2026-01-10', gradedAt: '2026-01-10' },
  { id: '2', examId: '1', studentId: '2', studentName: 'ليلى محمود', score: 92, totalPoints: 100, percentage: 92, status: 'passed', answers: [], submittedAt: '2026-01-11', gradedAt: '2026-01-11' },
  { id: '3', examId: '2', studentId: '3', studentName: 'يوسف إبراهيم', score: 95, totalPoints: 100, percentage: 95, status: 'passed', answers: [], submittedAt: '2026-01-12', gradedAt: '2026-01-12' },
  { id: '4', examId: '3', studentId: '4', studentName: 'نور سعيد', score: 78, totalPoints: 100, percentage: 78, status: 'passed', answers: [], submittedAt: '2026-01-13', gradedAt: '2026-01-13' },
  { id: '5', examId: '4', studentId: '5', studentName: 'كريم عبدالله', score: 97, totalPoints: 100, percentage: 97, status: 'passed', answers: [], submittedAt: '2026-01-14', gradedAt: '2026-01-14' },
];

// Subscriptions
export const subscriptionPlans: SubscriptionPlan[] = [
  { id: '1', name: 'الخطة الأساسية', description: 'وصول محدود للمحتوى', price: 99, duration: 1, features: ['وصول لـ 3 دورات', 'دعم عبر البريد', 'شهادة إتمام'], isPopular: false },
  { id: '2', name: 'الخطة الاحترافية', description: 'وصول كامل للمحتوى', price: 199, duration: 3, features: ['وصول لجميع الدورات', 'دعم مباشر 24/7', 'شهادة معتمدة', 'جلسات أسبوعية'], isPopular: true },
  { id: '3', name: 'الخطة المميزة', description: 'أفضل قيمة', price: 499, duration: 12, features: ['وصول مدى الحياة', 'دعم VIP', 'شهادة معتمدة', 'جلسات خاصة', 'خصومات حصرية'], isPopular: false },
];

export const subscriptions: Subscription[] = [
  { id: '1', studentId: '1', studentName: 'عمر خالد', plan: subscriptionPlans[1], startDate: '2025-10-01', endDate: '2026-01-01', status: 'active', autoRenew: true, price: 199, createdAt: '2025-10-01' },
  { id: '2', studentId: '2', studentName: 'ليلى محمود', plan: subscriptionPlans[2], startDate: '2025-09-01', endDate: '2026-09-01', status: 'active', autoRenew: true, price: 499, createdAt: '2025-09-01' },
  { id: '3', studentId: '3', studentName: 'يوسف إبراهيم', plan: subscriptionPlans[1], startDate: '2025-11-01', endDate: '2026-02-01', status: 'active', autoRenew: false, price: 199, createdAt: '2025-11-01' },
  { id: '4', studentId: '4', studentName: 'نور سعيد', plan: subscriptionPlans[0], startDate: '2025-10-15', endDate: '2025-11-15', status: 'expired', autoRenew: false, price: 99, createdAt: '2025-10-15' },
  { id: '5', studentId: '5', studentName: 'كريم عبدالله', plan: subscriptionPlans[2], startDate: '2025-08-01', endDate: '2026-08-01', status: 'active', autoRenew: true, price: 499, createdAt: '2025-08-01' },
  { id: '6', studentId: '6', studentName: 'مريم حسن', plan: subscriptionPlans[0], startDate: '2025-11-01', endDate: '2025-12-01', status: 'cancelled', autoRenew: false, price: 99, createdAt: '2025-11-01' },
];

// Access Codes
export const accessCodes: AccessCode[] = [
  { id: '1', code: 'EDU-2026-ABCD', courseId: '1', courseName: 'الرياضيات المتقدمة', status: 'active', expiresAt: '2026-06-01', createdAt: '2026-01-01' },
  { id: '2', code: 'EDU-2026-EFGH', planId: '2', planName: 'الخطة الاحترافية', status: 'used', usedBy: 'عمر خالد', usedAt: '2026-01-05', expiresAt: '2026-06-01', createdAt: '2026-01-01' },
  { id: '3', code: 'EDU-2026-IJKL', courseId: '2', courseName: 'الفيزياء الحديثة', status: 'active', expiresAt: '2026-06-01', createdAt: '2026-01-02' },
  { id: '4', code: 'EDU-2026-MNOP', planId: '3', planName: 'الخطة المميزة', status: 'active', expiresAt: '2026-12-01', createdAt: '2026-01-03' },
  { id: '5', code: 'EDU-2026-QRST', courseId: '3', courseName: 'الكيمياء العضوية', status: 'disabled', expiresAt: '2026-06-01', createdAt: '2026-01-04' },
  { id: '6', code: 'EDU-2026-UVWX', planId: '1', planName: 'الخطة الأساسية', status: 'expired', expiresAt: '2025-12-31', createdAt: '2025-12-01' },
  { id: '7', code: 'EDU-2026-YZAB', courseId: '4', courseName: 'الأحياء والعلوم', status: 'active', expiresAt: '2026-06-01', createdAt: '2026-01-05' },
  { id: '8', code: 'EDU-2026-CDEF', planId: '2', planName: 'الخطة الاحترافية', status: 'used', usedBy: 'ليلى محمود', usedAt: '2026-01-08', expiresAt: '2026-06-01', createdAt: '2026-01-06' },
];

// Payments
export const payments: Payment[] = [
  { id: '1', studentId: '1', studentName: 'عمر خالد', amount: 199, currency: 'SAR', type: 'subscription', status: 'completed', method: 'credit_card', description: 'اشتراك الخطة الاحترافية', createdAt: '2025-10-01' },
  { id: '2', studentId: '2', studentName: 'ليلى محمود', amount: 499, currency: 'SAR', type: 'subscription', status: 'completed', method: 'credit_card', description: 'اشتراك الخطة المميزة', createdAt: '2025-09-01' },
  { id: '3', studentId: '3', studentName: 'يوسف إبراهيم', amount: 299, currency: 'SAR', type: 'course', status: 'completed', method: 'bank_transfer', description: 'شراء دورة الرياضيات المتقدمة', createdAt: '2025-11-01' },
  { id: '4', studentId: '4', studentName: 'نور سعيد', amount: 99, currency: 'SAR', type: 'subscription', status: 'completed', method: 'cash', description: 'اشتراك الخطة الأساسية', createdAt: '2025-10-15' },
  { id: '5', studentId: '5', studentName: 'كريم عبدالله', amount: 499, currency: 'SAR', type: 'subscription', status: 'completed', method: 'credit_card', description: 'اشتراك الخطة المميزة', createdAt: '2025-08-01' },
  { id: '6', studentId: '6', studentName: 'مريم حسن', amount: 99, currency: 'SAR', type: 'refund', status: 'refunded', method: 'credit_card', description: 'استرداد اشتراك الخطة الأساسية', createdAt: '2025-11-20' },
  { id: '7', studentId: '7', studentName: 'علي رضا', amount: 249, currency: 'SAR', type: 'course', status: 'completed', method: 'credit_card', description: 'شراء دورة الكيمياء العضوية', createdAt: '2025-09-10' },
  { id: '8', studentId: '8', studentName: 'هدى طارق', amount: 279, currency: 'SAR', type: 'course', status: 'pending', method: 'bank_transfer', description: 'شراء دورة الأحياء والعلوم', createdAt: '2026-01-15' },
];

// Notifications
export const notifications: Notification[] = [
  { id: '1', title: 'إعلان هام', message: 'تم إضافة دورة جديدة في الرياضيات', type: 'info', targetAudience: 'all', status: 'sent', sentAt: '2026-01-10', readBy: ['1', '2', '3'], createdAt: '2026-01-10' },
  { id: '2', title: 'تذكير بالاختبار', message: 'اختبار الفيزياء يوم الخميس القادم', type: 'warning', targetAudience: 'specific', targetIds: ['1', '2', '3'], status: 'scheduled', scheduledAt: '2026-01-18', readBy: [], createdAt: '2026-01-12' },
  { id: '3', title: 'نتائج الاختبار', message: 'تم إعلان نتائج اختبار الرياضيات', type: 'success', targetAudience: 'students', status: 'sent', sentAt: '2026-01-14', readBy: ['1', '2'], createdAt: '2026-01-14' },
  { id: '4', title: 'صيانة مقررة', message: 'سيتم إيقاف المنصة للصيانة يوم الجمعة', type: 'warning', targetAudience: 'all', status: 'draft', readBy: [], createdAt: '2026-01-15' },
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
  totalStudents: 1247,
  activeStudents: 892,
  totalCourses: 24,
  totalRevenue: 485000,
  monthlyRevenue: 52000,
  lessonsCount: 356,
  examsCount: 78,
  activeSubscriptions: 654,
  studentGrowth: 12.5,
  revenueGrowth: 18.3,
};

// Activities
export const activities: Activity[] = [
  { id: '1', type: 'registration', description: 'تسجيل طالب جديد', studentName: 'أحمد سالم', timestamp: '2026-01-15T10:30:00' },
  { id: '2', type: 'payment', description: 'دفع اشتراك جديد', studentName: 'فاطمة محمد', amount: 199, timestamp: '2026-01-15T09:45:00' },
  { id: '3', type: 'exam', description: 'إكمال اختبار الرياضيات', studentName: 'عمر خالد', timestamp: '2026-01-15T09:15:00' },
  { id: '4', type: 'course_enrollment', description: 'الاشتراك في دورة جديدة', studentName: 'ليلى محمود', courseName: 'الفيزياء الحديثة', timestamp: '2026-01-15T08:30:00' },
  { id: '5', type: 'lesson_complete', description: 'إكمال درس', studentName: 'يوسف إبراهيم', courseName: 'الكيمياء العضوية', timestamp: '2026-01-15T08:00:00' },
  { id: '6', type: 'payment', description: 'دفع شراء دورة', studentName: 'كريم عبدالله', amount: 299, timestamp: '2026-01-14T16:30:00' },
  { id: '7', type: 'registration', description: 'تسجيل طالب جديد', studentName: 'سارة أحمد', timestamp: '2026-01-14T15:00:00' },
  { id: '8', type: 'exam', description: 'إكمال اختبار الفيزياء', studentName: 'نور سعيد', timestamp: '2026-01-14T14:30:00' },
];

// Revenue Chart Data
export const revenueChartData: RevenueChartData[] = [
  { month: 'يوليو', revenue: 42000, expenses: 15000, profit: 27000 },
  { month: 'أغسطس', revenue: 48000, expenses: 18000, profit: 30000 },
  { month: 'سبتمبر', revenue: 52000, expenses: 20000, profit: 32000 },
  { month: 'أكتوبر', revenue: 45000, expenses: 17000, profit: 28000 },
  { month: 'نوفمبر', revenue: 55000, expenses: 22000, profit: 33000 },
  { month: 'ديسمبر', revenue: 62000, expenses: 25000, profit: 37000 },
  { month: 'يناير', revenue: 52000, expenses: 19000, profit: 33000 },
];

// Student Growth Data
export const studentGrowthData: StudentGrowthData[] = [
  { month: 'يوليو', students: 850, active: 620 },
  { month: 'أغسطس', students: 920, active: 680 },
  { month: 'سبتمبر', students: 980, active: 720 },
  { month: 'أكتوبر', students: 1050, active: 780 },
  { month: 'نوفمبر', students: 1120, active: 820 },
  { month: 'ديسمبر', students: 1180, active: 850 },
  { month: 'يناير', students: 1247, active: 892 },
];

// Course Performance Data
export const coursePerformanceData: CoursePerformanceData[] = [
  { name: 'الرياضيات المتقدمة', students: 156, revenue: 45000, completionRate: 78 },
  { name: 'الفيزياء الحديثة', students: 132, revenue: 38000, completionRate: 72 },
  { name: 'الكيمياء العضوية', students: 98, revenue: 28000, completionRate: 65 },
  { name: 'الأحياء والعلوم', students: 145, revenue: 42000, completionRate: 80 },
  { name: 'اللغة العربية', students: 189, revenue: 52000, completionRate: 85 },
  { name: 'اللغة الإنجليزية', students: 210, revenue: 58000, completionRate: 82 },
];

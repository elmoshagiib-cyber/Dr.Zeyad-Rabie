// Core Types for Educational Platform Admin Dashboard

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'instructor' | 'student';
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  grade: string;
  enrolledCourses: string[];
  subscription?: Subscription;
  progress: number;
  totalExams: number;
  averageScore: number;
  lastActivity: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: Instructor;
  grade: string;
  subject: string;
  studentsCount: number;
  lessonsCount: number;
  examsCount: number;
  revenue: number;
  completionRate: number;
  status: 'published' | 'draft' | 'archived';
  price: number;
  duration: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instructor {
  id: string;
  name: string;
  avatar?: string;
  email: string;
  coursesCount: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  type: 'video' | 'pdf' | 'homework' | 'quiz';
  duration?: string;
  videoUrl?: string;
  pdfUrl?: string;
  attachments?: Attachment[];
  order: number;
  views: number;
  completionRate: number;
  averageWatchTime?: string;
  status: 'published' | 'draft';
  scheduledDate?: string;
  createdAt: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number;
  attempts: number[];
  averageScore: number;
  passRate: number;
  status: 'active' | 'draft' | 'closed';
  scheduledDate?: string;
  questions: Question[];
  createdAt: string;
}

export interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  score: number;
  totalPoints: number;
  percentage: number;
  status: 'passed' | 'failed' | 'pending';
  answers: Answer[];
  submittedAt: string;
  gradedAt?: string;
}

export interface Answer {
  questionId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  plan: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  autoRenew: boolean;
  price: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // months
  features: string[];
  isPopular: boolean;
}

export interface AccessCode {
  id: string;
  code: string;
  courseId?: string;
  courseName?: string;
  planId?: string;
  planName?: string;
  status: 'active' | 'used' | 'disabled' | 'expired';
  usedBy?: string;
  usedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  currency: string;
  type: 'subscription' | 'course' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'cash';
  description: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'students' | 'specific';
  targetIds?: string[];
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: string;
  sentAt?: string;
  readBy: string[];
  createdAt: string;
}

export interface FinancialReport {
  id: string;
  period: string;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  subscriptionsRevenue: number;
  coursesRevenue: number;
  refunds: number;
  pendingPayments: number;
  growth: number;
  topCourses: { courseId: string; name: string; revenue: number }[];
  paymentMethods: { method: string; amount: number; percentage: number }[];
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalCourses: number;
  totalRevenue: number;
  monthlyRevenue: number;
  lessonsCount: number;
  examsCount: number;
  activeSubscriptions: number;
  studentGrowth: number;
  revenueGrowth: number;
}

export interface Activity {
  id: string;
  type: 'registration' | 'payment' | 'exam' | 'course_enrollment' | 'lesson_complete';
  description: string;
  studentName?: string;
  courseName?: string;
  amount?: number;
  timestamp: string;
}

export interface ChartData {
  label: string;
  value: number;
  [key: string]: string | number;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface StudentGrowthData {
  month: string;
  students: number;
  active: number;
}

export interface CoursePerformanceData {
  name: string;
  students: number;
  revenue: number;
  completionRate: number;
}

// Form Types
export interface CourseFormData {
  title: string;
  description: string;
  instructorId: string;
  grade: string;
  subject: string;
  price: number;
  duration: string;
  thumbnail?: File;
  status: 'draft' | 'published';
}

export interface StudentFormData {
  name: string;
  email: string;
  phone?: string;
  grade: string;
  password: string;
  confirmPassword: string;
}

export interface ExamFormData {
  title: string;
  description: string;
  courseId: string;
  duration: number;
  passingScore: number;
  scheduledDate?: string;
  questions: QuestionFormData[];
}

export interface QuestionFormData {
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface NotificationFormData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  targetAudience: 'all' | 'students' | 'specific';
  targetIds?: string[];
  scheduledAt?: string;
}

export interface SettingsFormData {
  platformName: string;
  platformDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroImage?: File;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, string>;
}

import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  GraduationCap,
  FileText,
  CreditCard,
  Activity,
  PlayCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { Card, StatCard } from '../components/ui/Card';
import { dashboardStats, activities, revenueChartData, studentGrowthData, coursePerformanceData } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-500 mt-1">نظرة عامة على أداء المنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
            <option>آخر 3 أشهر</option>
            <option>آخر سنة</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="إجمالي الطلاب"
          value={dashboardStats.totalStudents.toLocaleString()}
          change={dashboardStats.studentGrowth}
          icon={<Users size={24} />}
          color="primary"
        />
        <StatCard
          title="الطلاب النشطون"
          value={dashboardStats.activeStudents.toLocaleString()}
          subtitle={`${Math.round((dashboardStats.activeStudents / dashboardStats.totalStudents) * 100)}% من الإجمالي`}
          icon={<Activity size={24} />}
          color="success"
        />
        <StatCard
          title="إجمالي الدورات"
          value={dashboardStats.totalCourses}
          icon={<BookOpen size={24} />}
          color="secondary"
        />
        <StatCard
          title="الإيرادات الشهرية"
          value={formatCurrency(dashboardStats.monthlyRevenue)}
          change={dashboardStats.revenueGrowth}
          icon={<DollarSign size={24} />}
          color="success"
        />
        <StatCard
          title="الدروس"
          value={dashboardStats.lessonsCount}
          icon={<PlayCircle size={24} />}
          color="info"
        />
        <StatCard
          title="الاختبارات"
          value={dashboardStats.examsCount}
          icon={<GraduationCap size={24} />}
          color="warning"
        />
        <StatCard
          title="الاشتراكات النشطة"
          value={dashboardStats.activeSubscriptions.toLocaleString()}
          icon={<CreditCard size={24} />}
          color="primary"
        />
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={<TrendingUp size={24} />}
          color="success"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">تحليل الإيرادات</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  formatter={(value: unknown) => formatCurrency(value as number)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Student Growth Chart */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">نمو الطلاب</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={studentGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={12} />
                <YAxis stroke="#94A3B8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Line type="monotone" dataKey="students" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="active" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Performance */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4">أداء الدورات</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coursePerformanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis type="number" stroke="#94A3B8" fontSize={12} tickFormatter={(value) => `${value / 1000}K`} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="students" fill="#4F46E5" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">طرق الدفع</h3>
          <div className="h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'بطاقة ائتمان', value: 65 },
                    { name: 'تحويل بنكي', value: 25 },
                    { name: 'نقدي', value: 10 },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#4F46E5" />
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-gray-600">بطاقة ائتمان</span>
              </div>
              <span className="font-semibold">65%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary" />
                <span className="text-gray-600">تحويل بنكي</span>
              </div>
              <span className="font-semibold">25%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success" />
                <span className="text-gray-600">نقدي</span>
              </div>
              <span className="font-semibold">10%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Feed & Recent Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">النشاط الأخير</h3>
            <button className="text-sm text-primary hover:underline">عرض الكل</button>
          </div>
          <div className="space-y-4">
            {activities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  activity.type === 'registration' ? 'bg-success/10 text-success' :
                  activity.type === 'payment' ? 'bg-primary/10 text-primary' :
                  activity.type === 'exam' ? 'bg-warning/10 text-warning' :
                  activity.type === 'course_enrollment' ? 'bg-secondary/10 text-secondary' :
                  'bg-info/10 text-info'
                }`}>
                  {activity.type === 'registration' && <Users size={18} />}
                  {activity.type === 'payment' && <DollarSign size={18} />}
                  {activity.type === 'exam' && <CheckCircle size={18} />}
                  {activity.type === 'course_enrollment' && <BookOpen size={18} />}
                  {activity.type === 'lesson_complete' && <FileText size={18} />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  {activity.studentName && <p className="text-xs text-gray-500 mt-0.5">{activity.studentName}</p>}
                  {activity.courseName && <p className="text-xs text-gray-500 mt-0.5">{activity.courseName}</p>}
                  {activity.amount && <p className="text-xs text-success mt-0.5">{formatCurrency(activity.amount)}</p>}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(activity.timestamp, 'relative')}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Stats */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">إحصائيات سريعة</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">معدل النجاح</p>
                  <p className="text-lg font-bold text-gray-900">87%</p>
                </div>
              </div>
              <span className="text-sm text-success">+5% من الشهر الماضي</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Clock size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">متوسط وقت المشاهدة</p>
                  <p className="text-lg font-bold text-gray-900">42 دقيقة</p>
                </div>
              </div>
              <span className="text-sm text-success">+12% من الشهر الماضي</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">معدل إكمال الدورات</p>
                  <p className="text-lg font-bold text-gray-900">76%</p>
                </div>
              </div>
              <span className="text-sm text-success">+3% من الشهر الماضي</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">معدل التجديد</p>
                  <p className="text-lg font-bold text-gray-900">92%</p>
                </div>
              </div>
              <span className="text-sm text-success">+2% من الشهر الماضي</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

import { Download, TrendingUp, DollarSign, CreditCard, FileText } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { revenueChartData, coursePerformanceData, payments } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export function Financial() {
  const totalRevenue = payments.filter((p) => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0);
  const pendingRevenue = payments.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
  const refundedAmount = payments.filter((p) => p.status === 'refunded').reduce((acc, p) => acc + p.amount, 0);

  const paymentMethodsData = [
    { name: 'بطاقة ائتمان', value: 65, amount: totalRevenue * 0.65 },
    { name: 'تحويل بنكي', value: 25, amount: totalRevenue * 0.25 },
    { name: 'نقدي', value: 10, amount: totalRevenue * 0.10 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">التقارير المالية</h1>
          <p className="text-gray-500 mt-1">تحليل ومتابعة الأداء المالي للمنصة</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
            <option>آخر 3 أشهر</option>
            <option>آخر سنة</option>
          </select>
          <Button variant="outline" icon={<Download size={20} />}>
            تصدير PDF
          </Button>
          <Button variant="outline" icon={<FileText size={20} />}>
            تصدير Excel
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-success mt-1">+18.3% من الشهر الماضي</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المدفوعات المعلقة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(pendingRevenue)}</p>
              <p className="text-xs text-warning mt-1">{payments.filter((p) => p.status === 'pending').length} مدفوعات</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">المبالغ المستردة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(refundedAmount)}</p>
              <p className="text-xs text-danger mt-1">{payments.filter((p) => p.status === 'refunded').length} عملية</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">صافي الربح</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalRevenue * 0.7)}</p>
              <p className="text-xs text-success mt-1">70% هامش ربح</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">اتجاه الإيرادات</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue2" x1="0" y1="0" x2="0" y2="1">
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
                  }}
                  formatter={(value: unknown) => formatCurrency(value as number)}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={2} fill="url(#colorRevenue2)" />
              </AreaChart>
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
                  data={paymentMethodsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  <Cell fill="#4F46E5" />
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip formatter={(value: unknown) => formatCurrency(value as number)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {paymentMethodsData.map((method, index) => (
              <div key={index} className="text-center p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600">{method.name}</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{formatCurrency(method.amount)}</p>
                <p className="text-xs text-gray-500">{method.value}%</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <h3 className="text-lg font-bold text-gray-900 mb-4">أفضل الدورات مبيعاً</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-right text-sm font-semibold text-gray-700">الدورة</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">الطلاب</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">الإيرادات</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">معدل الإكمال</th>
              </tr>
            </thead>
            <tbody>
              {coursePerformanceData.map((course, index) => (
                <tr key={index} className="border-b border-gray-50">
                  <td className="p-4">
                    <span className="font-medium text-gray-900">{course.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">{course.students}</td>
                  <td className="p-4">
                    <span className="font-semibold text-success">{formatCurrency(course.revenue)}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-20">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${course.completionRate}%` }} />
                      </div>
                      <span className="text-sm">{course.completionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Recent Payments */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">المدفوعات الأخيرة</h3>
          <button className="text-sm text-primary hover:underline">عرض الكل</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="p-4 text-right text-sm font-semibold text-gray-700">الطالب</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">النوع</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="p-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(0, 5).map((payment) => (
                <tr key={payment.id} className="border-b border-gray-50">
                  <td className="p-4">
                    <span className="font-medium text-gray-900">{payment.studentName}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600">
                      {payment.type === 'subscription' ? 'اشتراك' : payment.type === 'course' ? 'دورة' : 'استرداد'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      payment.status === 'completed' ? 'bg-success/10 text-success' :
                      payment.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-danger/10 text-danger'
                    }`}>
                      {payment.status === 'completed' ? 'مكتمل' : payment.status === 'pending' ? 'معلق' : 'مسترد'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{formatDate(payment.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

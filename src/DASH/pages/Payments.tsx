import { useState } from 'react';
import { Download, Eye, CreditCard, DollarSign, TrendingUp } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { payments } from '../data/mockData';
import { formatCurrency, formatDate } from '../utils/helpers';
import type { Payment } from '../types';

export function Payments() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed' | 'refunded'>('all');

  const filteredPayments = filter === 'all' ? payments : payments.filter((p) => p.status === filter);

  const columns = [
    {
      key: 'student',
      label: 'الطالب',
      render: (item: Payment) => (
        <div>
          <p className="font-medium text-gray-900">{item.studentName}</p>
          <p className="text-xs text-gray-500">{item.studentId}</p>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'المبلغ',
      render: (item: Payment) => (
        <span className="font-semibold text-gray-900">{formatCurrency(item.amount, item.currency)}</span>
      ),
      width: '120px',
    },
    {
      key: 'type',
      label: 'النوع',
      render: (item: Payment) => (
        <span className="text-sm">
          {item.type === 'subscription' ? 'اشتراك' : item.type === 'course' ? 'دورة' : 'استرداد'}
        </span>
      ),
      width: '100px',
    },
    {
      key: 'method',
      label: 'طريقة الدفع',
      render: (item: Payment) => (
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-gray-400" />
          <span className="text-sm">
            {item.method === 'credit_card' ? 'بطاقة ائتمان' : item.method === 'bank_transfer' ? 'تحويل بنكي' : 'نقدي'}
          </span>
        </div>
      ),
      width: '150px',
    },
    { key: 'description', label: 'الوصف', width: '200px' },
    { key: 'status', label: 'الحالة', render: (item: Payment) => <StatusBadge status={item.status} />, width: '100px' },
    { key: 'createdAt', label: 'التاريخ', render: (item: Payment) => formatDate(item.createdAt), width: '120px' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
          <p className="text-gray-500 mt-1">تتبع وإدارة جميع المعاملات المالية</p>
        </div>
        <Button variant="outline" icon={<Download size={20} />}>
          تصدير
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المدفوعات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(payments.filter((p) => p.status === 'completed').reduce((acc, p) => acc + p.amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">مدفوعات معلقة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(payments.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">استردادات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(payments.filter((p) => p.status === 'refunded').reduce((acc, p) => acc + p.amount, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">عدد المعاملات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Eye size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'completed', 'pending', 'failed', 'refunded'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-border'
            }`}
          >
            {status === 'all' ? 'الكل' : status === 'completed' ? 'مكتمل' : status === 'pending' ? 'معلق' : status === 'failed' ? 'فشل' : 'مسترد'}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <Table
        data={filteredPayments}
        columns={columns}
        searchPlaceholder="بحث عن دفعة..."
        actions={() => (
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="عرض التفاصيل">
            <Eye size={16} className="text-gray-600" />
          </button>
        )}
      />
    </div>
  );
}

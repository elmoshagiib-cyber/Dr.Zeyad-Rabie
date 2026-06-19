import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, CreditCard } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { subscriptions, subscriptionPlans } from '../data/mockData';
import { formatDate, formatCurrency } from '../utils/helpers';
import type { Subscription } from '../types';

export function Subscriptions() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      key: 'student',
      label: 'الطالب',
      render: (item: Subscription) => (
        <div>
          <p className="font-medium text-gray-900">{item.studentName}</p>
          <p className="text-xs text-gray-500">{item.studentId}</p>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'الخطة',
      render: (item: Subscription) => (
        <div>
          <p className="font-medium text-gray-900">{item.plan.name}</p>
          <p className="text-xs text-gray-500">{formatCurrency(item.plan.price)} / {item.plan.duration} أشهر</p>
        </div>
      ),
      width: '200px',
    },
    { key: 'startDate', label: 'تاريخ البدء', render: (item: Subscription) => formatDate(item.startDate), width: '120px' },
    { key: 'endDate', label: 'تاريخ الانتهاء', render: (item: Subscription) => formatDate(item.endDate), width: '120px' },
    {
      key: 'autoRenew',
      label: 'التجديد التلقائي',
      render: (item: Subscription) => (
        <span className={`px-2 py-1 rounded-full text-xs ${item.autoRenew ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'}`}>
          {item.autoRenew ? 'مفعل' : 'غير مفعل'}
        </span>
      ),
      width: '120px',
    },
    { key: 'status', label: 'الحالة', render: (item: Subscription) => <StatusBadge status={item.status} />, width: '100px' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الاشتراكات</h1>
          <p className="text-gray-500 mt-1">متابعة وتجديد اشتراكات الطلاب</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
          اشتراك جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الاشتراكات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{subscriptions.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <CreditCard size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الاشتراكات النشطة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscriptions.filter((s) => s.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Eye size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إيرادات الاشتراكات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(subscriptions.reduce((acc, s) => acc + s.price, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Plus size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">تجديد تلقائي</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {subscriptions.filter((s) => s.autoRenew).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Edit2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Subscription Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <Card key={plan.id} className={`relative ${plan.isPopular ? 'border-primary border-2' : ''}`}>
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-xs font-medium">
                الأكثر شعبية
              </div>
            )}
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              <p className="text-3xl font-bold text-primary mt-4">{formatCurrency(plan.price)}</p>
              <p className="text-sm text-gray-500">/{plan.duration} أشهر</p>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-5 h-5 rounded-full bg-success/10 text-success flex items-center justify-center text-xs">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
            <Button fullWidth variant={plan.isPopular ? 'primary' : 'outline'}>
              اختيار الخطة
            </Button>
          </Card>
        ))}
      </div>

      {/* Subscriptions Table */}
      <Table
        data={subscriptions}
        columns={columns}
        searchPlaceholder="بحث عن اشتراك..."
        actions={() => (
          <>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="عرض">
              <Eye size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
              <Edit2 size={16} className="text-gray-600" />
            </button>
            <button className="p-2 hover:bg-danger/10 rounded-lg transition-colors" title="حذف">
              <Trash2 size={16} className="text-danger" />
            </button>
          </>
        )}
      />

      {/* Add Subscription Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة اشتراك جديد"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="الطالب" placeholder="ابحث عن طالب..." />
          <Select
            label="الخطة"
            options={subscriptionPlans.map((p) => ({ value: p.id, label: `${p.name} - ${formatCurrency(p.price)}` }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="تاريخ البدء" type="date" />
            <Input label="تاريخ الانتهاء" type="date" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="autoRenew" className="w-4 h-4 rounded text-primary" />
            <label htmlFor="autoRenew" className="text-sm text-gray-700">تفعيل التجديد التلقائي</label>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">إضافة الاشتراك</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

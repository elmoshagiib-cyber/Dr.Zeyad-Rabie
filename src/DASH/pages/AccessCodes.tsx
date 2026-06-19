import { useState } from 'react';
import { Plus, Key, Download, Trash2, Ban, CheckCircle } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { accessCodes, courses, subscriptionPlans } from '../data/mockData';
import { formatDate, generateBulkAccessCodes } from '../utils/helpers';
import type { AccessCode } from '../types';

export function AccessCodes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bulkCount, setBulkCount] = useState(10);

  const columns = [
    {
      key: 'code',
      label: 'الكود',
      render: (item: AccessCode) => (
        <div className="flex items-center gap-2">
          <Key size={16} className="text-primary" />
          <span className="font-mono font-medium">{item.code}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'النوع',
      render: (item: AccessCode) => (
        <span className="text-sm">{item.courseName ? 'دورة' : item.planName ? 'اشتراك' : '-'}</span>
      ),
      width: '100px',
    },
    {
      key: 'target',
      label: 'الهدف',
      render: (item: AccessCode) => (
        <span className="text-sm">{item.courseName || item.planName || '-'}</span>
      ),
      width: '150px',
    },
    { key: 'usedBy', label: 'مستخدم بواسطة', render: (item: AccessCode) => item.usedBy || '-', width: '120px' },
    { key: 'usedAt', label: 'تاريخ الاستخدام', render: (item: AccessCode) => item.usedAt ? formatDate(item.usedAt) : '-', width: '120px' },
    { key: 'expiresAt', label: 'تاريخ الانتهاء', render: (item: AccessCode) => item.expiresAt ? formatDate(item.expiresAt) : '-', width: '120px' },
    { key: 'status', label: 'الحالة', render: (item: AccessCode) => <StatusBadge status={item.status} />, width: '100px' },
  ];

  const handleGenerateBulk = () => {
    const codes = generateBulkAccessCodes(bulkCount);
    console.log('Generated codes:', codes);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">أكواد الوصول</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة أكواد الوصول للدورات والاشتراكات</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download size={20} />}>
            تصدير
          </Button>
          <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
            توليد أكواد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الأكواد</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{accessCodes.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Key size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الأكواد النشطة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accessCodes.filter((c) => c.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الأكواد المستخدمة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accessCodes.filter((c) => c.status === 'used').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Download size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الأكواد المعطلة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {accessCodes.filter((c) => c.status === 'disabled' || c.status === 'expired').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-danger/10 text-danger flex items-center justify-center">
              <Ban size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Access Codes Table */}
      <Table
        data={accessCodes}
        columns={columns}
        searchPlaceholder="بحث عن كود..."
        actions={(item) => (
          <>
            {item.status === 'active' && (
              <button className="p-2 hover:bg-danger/10 rounded-lg transition-colors" title="تعطيل">
                <Ban size={16} className="text-danger" />
              </button>
            )}
            <button className="p-2 hover:bg-danger/10 rounded-lg transition-colors" title="حذف">
              <Trash2 size={16} className="text-danger" />
            </button>
          </>
        )}
      />

      {/* Generate Codes Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="توليد أكواد وصول"
        size="md"
      >
        <form className="space-y-4">
          <Select
            label="نوع الكود"
            options={[
              { value: 'course', label: 'دورة' },
              { value: 'subscription', label: 'اشتراك' },
            ]}
          />
          <Select
            label="اختر الدورة/الخطة"
            options={[
              ...courses.map((c) => ({ value: c.id, label: c.title })),
              ...subscriptionPlans.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
          <Input
            label="عدد الأكواد"
            type="number"
            min="1"
            max="100"
            value={bulkCount}
            onChange={(e) => setBulkCount(parseInt(e.target.value) || 10)}
            hint="يمكن توليد حتى 100 كود دفعة واحدة"
          />
          <Input label="تاريخ الانتهاء" type="date" />
          <div className="bg-gray-50 p-4 rounded-xl">
            <p className="text-sm text-gray-600">
              سيتم توليد <span className="font-bold text-primary">{bulkCount}</span> أكواد فريدة
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit" onClick={(e) => { e.preventDefault(); handleGenerateBulk(); }}>
              توليد الأكواد
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

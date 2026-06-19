import { useState } from 'react';
import { Plus, Bell, Send, Clock, Trash2, Edit2, Eye } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { notifications } from '../data/mockData';
import { formatDateTime } from '../utils/helpers';
import type { Notification } from '../types';

export function Notifications() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      key: 'title',
      label: 'العنوان',
      render: (item: Notification) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            item.type === 'info' ? 'bg-info/10 text-info' :
            item.type === 'success' ? 'bg-success/10 text-success' :
            item.type === 'warning' ? 'bg-warning/10 text-warning' :
            'bg-danger/10 text-danger'
          }`}>
            <Bell size={20} />
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500 line-clamp-1">{item.message}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'targetAudience',
      label: 'الجمهور المستهدف',
      render: (item: Notification) => (
        <span className="text-sm">
          {item.targetAudience === 'all' ? 'الجميع' : item.targetAudience === 'students' ? 'الطلاب' : 'محدد'}
        </span>
      ),
      width: '150px',
    },
    { key: 'status', label: 'الحالة', render: (item: Notification) => <StatusBadge status={item.status} />, width: '100px' },
    {
      key: 'scheduledAt',
      label: 'موعد الإرسال',
      render: (item: Notification) => (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span className="text-sm">{item.scheduledAt ? formatDateTime(item.scheduledAt) : item.sentAt ? formatDateTime(item.sentAt) : '-'}</span>
        </div>
      ),
      width: '180px',
    },
    {
      key: 'readBy',
      label: 'المقروءة',
      render: (item: Notification) => (
        <span className="text-sm">{item.readBy.length} طالب</span>
      ),
      width: '100px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">مركز الإشعارات</h1>
          <p className="text-gray-500 mt-1">إرسال ومتابعة الإشعارات للطلاب</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
          إشعار جديد
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الإشعارات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{notifications.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bell size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">تم الإرسال</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {notifications.filter((n) => n.status === 'sent').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Send size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">مجدولة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {notifications.filter((n) => n.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">مسودات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {notifications.filter((n) => n.status === 'draft').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center">
              <Edit2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications Table */}
      <Table
        data={notifications}
        columns={columns}
        searchPlaceholder="بحث عن إشعار..."
        actions={(item) => (
          <>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="عرض">
              <Eye size={16} className="text-gray-600" />
            </button>
            {item.status === 'draft' && (
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
                <Edit2 size={16} className="text-gray-600" />
              </button>
            )}
            <button className="p-2 hover:bg-danger/10 rounded-lg transition-colors" title="حذف">
              <Trash2 size={16} className="text-danger" />
            </button>
          </>
        )}
      />

      {/* Create Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء إشعار جديد"
        size="lg"
      >
        <form className="space-y-4">
          <Input label="عنوان الإشعار" placeholder="أدخل عنوان الإشعار" />
          <TextArea label="نص الإشعار" placeholder="اكتب محتوى الإشعار..." rows={4} />
          <Select
            label="نوع الإشعار"
            options={[
              { value: 'info', label: 'معلومات' },
              { value: 'success', label: 'نجاح' },
              { value: 'warning', label: 'تحذير' },
              { value: 'error', label: 'خطأ' },
            ]}
          />
          <Select
            label="الجمهور المستهدف"
            options={[
              { value: 'all', label: 'جميع المستخدمين' },
              { value: 'students', label: 'الطلاب فقط' },
              { value: 'specific', label: 'طلاب محددين' },
            ]}
          />
          <Input label="جدولة الإرسال" type="datetime-local" />
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              حفظ كمسودة
            </Button>
            <Button type="submit" icon={<Send size={20} />}>
              إرسال الإشعار
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

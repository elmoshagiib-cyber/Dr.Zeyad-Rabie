import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Clock, Award } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { exams, courses } from '../data/mockData';
import { formatDate } from '../utils/helpers';
import type { Exam } from '../types';

export function Exams() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      key: 'title',
      label: 'عنوان الاختبار',
      render: (item: Exam) => (
        <div>
          <p className="font-medium text-gray-900">{item.title}</p>
          <p className="text-xs text-gray-500">{courses.find((c) => c.id === item.courseId)?.title || '-'}</p>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'المدة',
      render: (item: Exam) => (
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-400" />
          <span>{item.duration} دقيقة</span>
        </div>
      ),
      width: '100px',
    },
    { key: 'totalQuestions', label: 'الأسئلة', width: '80px' },
    {
      key: 'averageScore',
      label: 'متوسط الدرجات',
      render: (item: Exam) => (
        <div className="flex items-center gap-2">
          <Award size={16} className={item.averageScore >= 80 ? 'text-success' : item.averageScore >= 60 ? 'text-warning' : 'text-danger'} />
          <span className="font-semibold">{item.averageScore}%</span>
        </div>
      ),
      width: '120px',
    },
    {
      key: 'passRate',
      label: 'معدل النجاح',
      render: (item: Exam) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-20">
            <div className="h-full bg-success rounded-full" style={{ width: `${item.passRate}%` }} />
          </div>
          <span className="text-sm">{item.passRate}%</span>
        </div>
      ),
      width: '150px',
    },
    { key: 'status', label: 'الحالة', render: (item: Exam) => <StatusBadge status={item.status} />, width: '100px' },
    { key: 'scheduledDate', label: 'موعد الاختبار', render: (item: Exam) => item.scheduledDate ? formatDate(item.scheduledDate) : '-', width: '120px' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الاختبارات</h1>
          <p className="text-gray-500 mt-1">إنشاء ومتابعة الاختبارات والنتائج</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={20} />}>
          إنشاء اختبار
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الاختبارات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{exams.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Award size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(exams.reduce((acc, e) => acc + e.averageScore, 0) / exams.length)}%
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
              <p className="text-sm text-gray-500">معدل النجاح</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(exams.reduce((acc, e) => acc + e.passRate, 0) / exams.length)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Clock size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الاختبارات النشطة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {exams.filter((e) => e.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Edit2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Exams Table */}
      <Table
        data={exams}
        columns={columns}
        searchPlaceholder="بحث عن اختبار..."
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

      {/* Add Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إنشاء اختبار جديد"
        size="xl"
      >
        <form className="space-y-4">
          <Select
            label="الدورة"
            options={courses.map((c) => ({ value: c.id, label: c.title }))}
          />
          <Input label="عنوان الاختبار" placeholder="أدخل عنوان الاختبار" />
          <TextArea label="وصف الاختبار" placeholder="وصف محتوى الاختبار..." rows={3} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="المدة (دقائق)" type="number" placeholder="60" />
            <Input label="درجة النجاح" type="number" placeholder="60" />
            <Input label="عدد الأسئلة" type="number" placeholder="20" />
          </div>
          <Input label="موعد الاختبار" type="date" />
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">إنشاء الاختبار</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

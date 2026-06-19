import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Download } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { students } from '../data/mockData';
import { formatDate, getInitials } from '../utils/helpers';
import type { Student } from '../types';

export function Students() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const columns = [
    {
      key: 'student',
      label: 'الطالب',
      render: (item: Student) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
            {getInitials(item.name)}
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-500">{item.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', label: 'الصف', width: '120px' },
    {
      key: 'enrolledCourses',
      label: 'الدورات',
      render: (item: Student) => (
        <span className="text-sm">{item.enrolledCourses.length} دورات</span>
      ),
      width: '100px',
    },
    {
      key: 'progress',
      label: 'التقدم',
      render: (item: Student) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${item.progress}%` }}
            />
          </div>
          <span className="text-sm font-medium">{item.progress}%</span>
        </div>
      ),
      width: '150px',
    },
    {
      key: 'averageScore',
      label: 'المعدل',
      render: (item: Student) => (
        <span className={`font-semibold ${item.averageScore >= 80 ? 'text-success' : item.averageScore >= 60 ? 'text-warning' : 'text-danger'}`}>
          {item.averageScore}%
        </span>
      ),
      width: '80px',
    },
    { key: 'status', label: 'الحالة', render: (item: Student) => <StatusBadge status={item.status} />, width: '100px' },
    { key: 'lastActivity', label: 'آخر نشاط', render: (item: Student) => formatDate(item.lastActivity), width: '120px' },
  ];

  const handleAddStudent = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الطلاب</h1>
          <p className="text-gray-500 mt-1">عرض وإدارة جميع الطلاب المسجلين</p>
        </div>
        <Button onClick={handleAddStudent} icon={<Plus size={20} />}>
          إضافة طالب
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{students.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الطلاب النشطون</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {students.filter((s) => s.status === 'active').length}
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
              <p className="text-sm text-gray-500">متوسط التقدم</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)}%
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
              <p className="text-sm text-gray-500">متوسط الدرجات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
              <Edit2 size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Students Table */}
      <Table
        data={students}
        columns={columns}
        searchPlaceholder="بحث عن طالب..."
        actions={(item) => (
          <>
            <button
              onClick={() => handleEditStudent(item)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="تعديل"
            >
              <Edit2 size={16} className="text-gray-600" />
            </button>
            <button
              className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 size={16} className="text-danger" />
            </button>
          </>
        )}
        onRowClick={(item) => console.log('View student:', item)}
      />

      {/* Add/Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
        size="lg"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم الطالب" placeholder="أدخل اسم الطالب" defaultValue={editingStudent?.name} />
            <Input label="البريد الإلكتروني" type="email" placeholder="email@example.com" defaultValue={editingStudent?.email} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="رقم الهاتف" placeholder="0501234567" defaultValue={editingStudent?.phone} />
            <Select
              label="الصف الدراسي"
              options={[
                { value: '1', label: 'الثانوية الأولى' },
                { value: '2', label: 'الثانوية الثانية' },
                { value: '3', label: 'الثانوية الثالثة' },
              ]}
              defaultValue={editingStudent?.grade}
            />
          </div>
          <TextArea label="ملاحظات" placeholder="أي ملاحظات إضافية..." rows={3} />
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {editingStudent ? 'حفظ التعديلات' : 'إضافة الطالب'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

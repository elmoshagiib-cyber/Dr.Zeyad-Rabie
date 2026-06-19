import { useState } from 'react';
import { Plus, PlayCircle, FileText, Video, Edit2, Trash2, Eye } from 'lucide-react';
import { Table, StatusBadge } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { lessons, courses } from '../data/mockData';
import { formatDate } from '../utils/helpers';
import type { Lesson } from '../types';

export function Lessons() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      key: 'title',
      label: 'عنوان الدرس',
      render: (item: Lesson) => (
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            item.type === 'video' ? 'bg-primary/10 text-primary' :
            item.type === 'pdf' ? 'bg-danger/10 text-danger' :
            item.type === 'homework' ? 'bg-warning/10 text-warning' :
            'bg-info/10 text-info'
          }`}>
            {item.type === 'video' && <Video size={20} />}
            {item.type === 'pdf' && <FileText size={20} />}
            {item.type === 'homework' && <Edit2 size={20} />}
            {item.type === 'quiz' && <PlayCircle size={20} />}
          </div>
          <div>
            <p className="font-medium text-gray-900">{item.title}</p>
            <p className="text-xs text-gray-500">{courses.find((c) => c.id === item.courseId)?.title || '-'}</p>
          </div>
        </div>
      ),
    },
    { key: 'type', label: 'النوع', render: (item: Lesson) => {
        const types = { video: 'فيديو', pdf: 'ملف PDF', homework: 'واجب', quiz: 'اختبار' };
        return <span className="text-sm">{types[item.type as keyof typeof types]}</span>;
      }, width: '100px' },
    { key: 'duration', label: 'المدة', render: (item: Lesson) => item.duration || '-', width: '80px' },
    {
      key: 'views',
      label: 'المشاهدات',
      render: (item: Lesson) => <span className="font-medium">{item.views}</span>,
      width: '100px',
    },
    {
      key: 'completionRate',
      label: 'معدل الإكمال',
      render: (item: Lesson) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden w-20">
            <div className="h-full bg-success rounded-full" style={{ width: `${item.completionRate}%` }} />
          </div>
          <span className="text-sm">{item.completionRate}%</span>
        </div>
      ),
      width: '150px',
    },
    { key: 'status', label: 'الحالة', render: (item: Lesson) => <StatusBadge status={item.status} />, width: '100px' },
    { key: 'createdAt', label: 'تاريخ الإنشاء', render: (item: Lesson) => formatDate(item.createdAt), width: '120px' },
  ];

  const handleAddLesson = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الدروس</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة محتوى الدروس</p>
        </div>
        <Button onClick={handleAddLesson} icon={<Plus size={20} />}>
          إضافة درس
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الدروس</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{lessons.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <PlayCircle size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">دروس الفيديو</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lessons.filter((l) => l.type === 'video').length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Video size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي المشاهدات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {lessons.reduce((acc, l) => acc + l.views, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Eye size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">متوسط الإكمال</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {Math.round(lessons.reduce((acc, l) => acc + l.completionRate, 0) / lessons.length)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <FileText size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Lessons Table */}
      <Table
        data={lessons}
        columns={columns}
        searchPlaceholder="بحث عن درس..."
        actions={(_item) => (
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

      {/* Add Lesson Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="إضافة درس جديد"
        size="lg"
      >
        <form className="space-y-4">
          <Select
            label="الدورة"
            options={courses.map((c) => ({ value: c.id, label: c.title }))}
          />
          <Input label="عنوان الدرس" placeholder="أدخل عنوان الدرس" />
          <Select
            label="نوع الدرس"
            options={[
              { value: 'video', label: 'فيديو' },
              { value: 'pdf', label: 'ملف PDF' },
              { value: 'homework', label: 'واجب' },
              { value: 'quiz', label: 'اختبار' },
            ]}
          />
          <TextArea label="وصف الدرس" placeholder="وصف محتوى الدرس..." rows={3} />
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-gray-500">اسحب وأفلت الملف هنا، أو انقر للرفع</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">إضافة الدرس</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

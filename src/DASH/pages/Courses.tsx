import { useState } from 'react';
import { Plus, Edit2, Trash2, Copy, Archive, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { courses } from '../data/mockData';
import { formatCurrency, getStatusColor, getStatusLabel } from '../utils/helpers';
import type { Course } from '../types';

export function Courses() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');

  const filteredCourses = filter === 'all' ? courses : courses.filter((c) => c.status === filter);

  const handleAddCourse = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الدورات</h1>
          <p className="text-gray-500 mt-1">إنشاء وإدارة الدورات التعليمية</p>
        </div>
        <Button onClick={handleAddCourse} icon={<Plus size={20} />}>
          إنشاء دورة
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الدورات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{courses.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Plus size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">الدورات المنشورة</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.filter((c) => c.status === 'published').length}
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
              <p className="text-sm text-gray-500">إجمالي الطلاب</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {courses.reduce((acc, c) => acc + c.studentsCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Copy size={24} />
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">إجمالي الإيرادات</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(courses.reduce((acc, c) => acc + c.revenue, 0))}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <Archive size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-border'
            }`}
          >
            {status === 'all' ? 'الكل' : getStatusLabel(status)}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card key={course.id} hover className="overflow-hidden p-0">
            <div className="relative">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-40 object-cover"
              />
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                {getStatusLabel(course.status)}
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{course.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <img src={course.instructor.avatar} alt={course.instructor.name} className="w-6 h-6 rounded-full" />
                <span className="text-sm text-gray-600">{course.instructor.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">الطلاب</p>
                  <p className="font-semibold text-gray-900">{course.studentsCount}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">الدروس</p>
                  <p className="font-semibold text-gray-900">{course.lessonsCount}</p>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">الاختبارات</p>
                  <p className="font-semibold text-gray-900">{course.examsCount}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-xs text-gray-500">السعر</p>
                  <p className="font-bold text-primary">{formatCurrency(course.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="تعديل"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="نسخ">
                    <Copy size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-danger/10 rounded-lg transition-colors" title="حذف">
                    <Trash2 size={16} className="text-danger" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Course Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'تعديل الدورة' : 'إنشاء دورة جديدة'}
        size="xl"
      >
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="عنوان الدورة" placeholder="أدخل عنوان الدورة" defaultValue={editingCourse?.title} />
            <Select
              label="المادة"
              options={[
                { value: 'math', label: 'الرياضيات' },
                { value: 'physics', label: 'الفيزياء' },
                { value: 'chemistry', label: 'الكيمياء' },
                { value: 'biology', label: 'الأحياء' },
                { value: 'arabic', label: 'اللغة العربية' },
                { value: 'english', label: 'اللغة الإنجليزية' },
              ]}
              defaultValue={editingCourse?.subject}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="الصف الدراسي"
              options={[
                { value: '1', label: 'الثانوية الأولى' },
                { value: '2', label: 'الثانوية الثانية' },
                { value: '3', label: 'الثانوية الثالثة' },
              ]}
              defaultValue={editingCourse?.grade}
            />
            <Select
              label="المعلم"
              options={[
                { value: '1', label: 'أحمد محمد' },
                { value: '2', label: 'فاطمة علي' },
                { value: '3', label: 'محمد حسن' },
                { value: '4', label: 'سارة أحمد' },
              ]}
              defaultValue={editingCourse?.instructor.id}
            />
          </div>
          <TextArea label="وصف الدورة" placeholder="وصف تفصيلي للدورة..." rows={4} defaultValue={editingCourse?.description} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="السعر (ريال)" type="number" defaultValue={editingCourse?.price} />
            <Input label="المدة" placeholder="مثال: 3 أشهر" defaultValue={editingCourse?.duration} />
            <Select
              label="الحالة"
              options={[
                { value: 'draft', label: 'مسودة' },
                { value: 'published', label: 'منشور' },
                { value: 'archived', label: 'مؤرشف' },
              ]}
              defaultValue={editingCourse?.status}
            />
          </div>
          <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
            <p className="text-gray-500">اسحب وأفلت صورة مصغرة هنا، أو انقر للرفع</p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {editingCourse ? 'حفظ التعديلات' : 'إنشاء الدورة'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

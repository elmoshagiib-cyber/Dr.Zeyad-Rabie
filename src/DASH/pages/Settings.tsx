import { useState } from 'react';
import { Save, Upload, Globe, Shield, Bell, Palette } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select, TextArea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { cn } from '../utils/helpers';

type Tab = 'general' | 'seo' | 'hero' | 'notifications' | 'permissions';

export function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  const tabs = [
    { id: 'general' as Tab, label: 'عام', icon: <Globe size={18} /> },
    { id: 'seo' as Tab, label: 'SEO', icon: <Globe size={18} /> },
    { id: 'hero' as Tab, label: 'الصفحة الرئيسية', icon: <Palette size={18} /> },
    { id: 'notifications' as Tab, label: 'الإشعارات', icon: <Bell size={18} /> },
    { id: 'permissions' as Tab, label: 'الصلاحيات', icon: <Shield size={18} /> },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-500 mt-1">تكوين إعدادات المنصة</p>
        </div>
        <Button icon={<Save size={20} />}>
          حفظ التغييرات
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">معلومات المنصة</h3>
            <div className="space-y-4">
              <Input label="اسم المنصة" placeholder="EduAdmin Pro" defaultValue="EduAdmin Pro" />
              <TextArea label="وصف المنصة" placeholder="وصف قصير للمنصة..." rows={3} defaultValue="منصة تعليمية متكاملة للثانوية العامة" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="البريد الإلكتروني" type="email" placeholder="contact@eduadmin.com" defaultValue="contact@eduadmin.com" />
                <Input label="رقم الهاتف" placeholder="+966 50 123 4567" defaultValue="+966 50 123 4567" />
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">روابط التواصل الاجتماعي</h3>
            <div className="space-y-4">
              <Input label="فيسبوك" placeholder="https://facebook.com/..." />
              <Input label="تويتر" placeholder="https://twitter.com/..." />
              <Input label="إنستغرام" placeholder="https://instagram.com/..." />
              <Input label="يوتيوب" placeholder="https://youtube.com/..." />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">اللغة والمنطقة</h3>
            <div className="space-y-4">
              <Select
                label="اللغة الافتراضية"
                options={[
                  { value: 'ar', label: 'العربية' },
                  { value: 'en', label: 'English' },
                ]}
                defaultValue="ar"
              />
              <Select
                label="المنطقة الزمنية"
                options={[
                  { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
                  { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
                  { value: 'Africa/Cairo', label: 'القاهرة (GMT+2)' },
                ]}
                defaultValue="Asia/Riyadh"
              />
              <Select
                label="العملة"
                options={[
                  { value: 'SAR', label: 'ريال سعودي (SAR)' },
                  { value: 'USD', label: 'دولار أمريكي (USD)' },
                  { value: 'EGP', label: 'جنيه مصري (EGP)' },
                  { value: 'AED', label: 'درهم إماراتي (AED)' },
                ]}
                defaultValue="SAR"
              />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">الشعار والهوية</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">اسحب وأفلت الشعار هنا، أو انقر للرفع</p>
                <p className="text-xs text-gray-400 mt-1">PNG أو JPG، الحد الأقصى 2MB</p>
              </div>
              <Input label="لون العلامة التجارية" type="color" defaultValue="#4F46E5" />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'seo' && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات SEO</h3>
          <div className="space-y-4">
            <Input label="عنوان الصفحة" placeholder="عنوان يظهر في محركات البحث" defaultValue="EduAdmin Pro - المنصة التعليمية المتكاملة" />
            <TextArea label="وصف الصفحة" placeholder="وصف يظهر في نتائج البحث..." rows={3} defaultValue="منصة تعليمية متكاملة تقدم أفضل الدورات التعليمية للثانوية العامة مع معلمين متميزين" />
            <Input label="الكلمات المفتاحية" placeholder="كلمات مفصولة بفواصل" defaultValue="تعليم, ثانوية, دورات, اختبار, رياضيات, فيزياء" hint="افصل بين الكلمات بفاصلة" />
            <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">صورة مشاركة social media</p>
              <p className="text-xs text-gray-400 mt-1">1200x630 بكسل موصى به</p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'hero' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">محتوى القسم الرئيسي</h3>
            <div className="space-y-4">
              <Input label="العنوان الرئيسي" placeholder="عنوان جذاب" defaultValue="تعلم بذكاء لمستقبل أفضل" />
              <TextArea label="الوصف" placeholder="وصف مقنع..." rows={3} defaultValue="انضم إلى آلاف الطلاب الناجحين واحصل على أفضل تعليم ثانوي مع نخبة من المعلمين" />
              <Input label="نص زر الدعوة" placeholder="مثال: ابدأ الآن" defaultValue="ابدأ رحلتك التعليمية" />
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">صورة القسم الرئيسي</p>
                <p className="text-xs text-gray-400 mt-1">1920x1080 بكسل موصى به</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4">الشهادات والآراء</h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">أحمد محمد - طالب</p>
                  <button className="text-danger text-sm">حذف</button>
                </div>
                <p className="text-sm text-gray-600">"منصة رائعة ساعدتني في تحسين درجاتي بشكل ملحوظ"</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">فاطمة علي - طالبة</p>
                  <button className="text-danger text-sm">حذف</button>
                </div>
                <p className="text-sm text-gray-600">"المعلمون ممتازون والشرح واضح ومفهوم"</p>
              </div>
              <Button fullWidth variant="outline" icon={<Plus size={16} />}>
                إضافة شهادة جديدة
              </Button>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات الإشعارات</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">إشعارات التسجيل الجديد</p>
                <p className="text-sm text-gray-500">استلم إشعار عند تسجيل طالب جديد</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">إشعارات الدفع</p>
                <p className="text-sm text-gray-500">استلم إشعار عند اكتمال دفعة جديدة</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">إشعارات انتهاء الاشتراكات</p>
                <p className="text-sm text-gray-500">تنبيه قبل انتهاء اشتراكات الطلاب</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">إشعارات الاختبارات</p>
                <p className="text-sm text-gray-500">تنبيه عند اكتمال الاختبارات</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">الصلاحيات والأدوار</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="p-4 text-right text-sm font-semibold text-gray-700">الصلاحية</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">مدير</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">معلم</th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-700">مساعد</th>
                </tr>
              </thead>
              <tbody>
                {['إدارة الطلاب', 'إدارة الدورات', 'إدارة الاختبارات', 'عرض التقارير', 'إدارة الاشتراكات', 'إدارة الإعدادات'].map((permission, index) => (
                  <tr key={index} className="border-b border-gray-50">
                    <td className="p-4 text-sm text-gray-700">{permission}</td>
                    <td className="p-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary" defaultChecked />
                    </td>
                    <td className="p-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary" defaultChecked={index < 3} />
                    </td>
                    <td className="p-4 text-center">
                      <input type="checkbox" className="w-4 h-4 rounded text-primary" defaultChecked={index < 2} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

// Import Plus from lucide-react
import { Plus } from 'lucide-react';

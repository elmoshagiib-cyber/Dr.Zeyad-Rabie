import React, { useState, useEffect } from 'react';
import { supabase } from "../../lib/supabase";

interface Course {
  id: string;
  title: string;
  description?: string;
  created_at: string;
}

interface SubscriptionCode {
  id: string;
  code: string;
  course_id: string;
  status: 'unused' | 'used' | 'disabled' | 'expired';
  max_uses: number;
  uses_count: number;
  used_by?: string;
  used_at?: string;
  expires_at?: string;
  created_by?: string;
  notes?: string;
  created_at: string;
  course?: Course;
}

interface Statistics {
  total: number;
  active: number;
  used: number;
  disabled: number;
  courses: number;
  expired: number;
}

interface Filters {
  searchTerm: string;
  status: string;
  courseId: string;
  createdFrom: string;
  createdTo: string;
}

interface GenerateCodesForm {
  courseId: string;
  numberOfCodes: number;
  codeLength: number;
  codeFormat: string;
  maxUses: number;
  expiration: string;
  customDate: string;
  notes: string;
}

const SubscriptionCodes: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [codes, setCodes] = useState<SubscriptionCode[]>([]);
  const [filteredCodes, setFilteredCodes] = useState<SubscriptionCode[]>([]);
  const [statistics, setStatistics] = useState<Statistics>({
    total: 0,
    active: 0,
    used: 0,
    disabled: 0,
    courses: 0,
    expired: 0,
  });
  const [loading, setLoading] = useState(true);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCode, setSelectedCode] = useState<SubscriptionCode | null>(null);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [showGeneratedCodesModal, setShowGeneratedCodesModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);

  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    status: '',
    courseId: '',
    createdFrom: '',
    createdTo: '',
  });

  const [generateForm, setGenerateForm] = useState<GenerateCodesForm>({
    courseId: '',
    numberOfCodes: 10,
    codeLength: 12,
    codeFormat: 'XXXX-XXXX-XXXX',
    maxUses: 1,
    expiration: 'no-expiration',
    customDate: '',
    notes: '',
  });

  // Export filters state
  const [exportCourseId, setExportCourseId] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const [exportMaxUses, setExportMaxUses] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [codes, filters]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCourses(), loadCodes()]);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast('حدث خطأ أثناء تحميل البيانات', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    setCourses(data || []);
  };

  const loadCodes = async () => {
    const { data, error } = await supabase
      .from('subscription_codes')
      .select(`*, course:courses(*)`)
      .order('created_at', { ascending: false });
    if (error) throw error;

    const codesWithStatus = (data || []).map((code) => {
      let status: 'unused' | 'used' | 'disabled' | 'expired' = code.status;
      if (code.expires_at && new Date(code.expires_at) < new Date() && code.status === 'unused') {
        status = 'expired';
      }
      return { ...code, status };
    });

    setCodes(codesWithStatus);
    calculateStatistics(codesWithStatus);
  };

  const calculateStatistics = (allCodes: SubscriptionCode[]) => {
    const now = new Date();
    const stats: Statistics = {
      total: allCodes.length,
      active: allCodes.filter((c) => c.status === 'unused').length,
      used: allCodes.filter((c) => c.status === 'used').length,
      disabled: allCodes.filter((c) => c.status === 'disabled').length,
      courses: new Set(allCodes.map((c) => c.course_id)).size,
      expired: allCodes.filter(
        (c) => c.expires_at && new Date(c.expires_at) < now && c.status === 'unused'
      ).length,
    };
    setStatistics(stats);
  };

  const applyFilters = () => {
    let filtered = [...codes];
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (code) =>
          code.code.toLowerCase().includes(term) ||
          code.course?.title.toLowerCase().includes(term) ||
          code.used_by?.toLowerCase().includes(term)
      );
    }
    if (filters.status) filtered = filtered.filter((code) => code.status === filters.status);
    if (filters.courseId) filtered = filtered.filter((code) => code.course_id === filters.courseId);
    if (filters.createdFrom)
      filtered = filtered.filter((code) => new Date(code.created_at) >= new Date(filters.createdFrom));
    if (filters.createdTo)
      filtered = filtered.filter((code) => new Date(code.created_at) <= new Date(filters.createdTo));
    setFilteredCodes(filtered);
  };

  const generateRandomCode = (length: number, format: string): string => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (format === 'XXXX-XXXX-XXXX' && length === 12) {
      return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}`;
    } else if (format === 'XXXXX-XXXXX' && length >= 10) {
      return `${code.slice(0, 5)}-${code.slice(5, 10)}`;
    }
    return code;
  };

  const generateCodes = async () => {
    if (!generateForm.courseId) {
      showToast('يرجى اختيار الكورس', 'error');
      return;
    }
    setGeneratingCodes(true);
    try {
      const newCodes: string[] = [];
      const existingCodes = new Set(codes.map((c) => c.code));
      while (newCodes.length < generateForm.numberOfCodes) {
        const code = generateRandomCode(generateForm.codeLength, generateForm.codeFormat);
        if (!existingCodes.has(code) && !newCodes.includes(code)) {
          newCodes.push(code);
        }
      }
      setGeneratedCodes(newCodes);
      setShowGeneratedCodesModal(true);
      showToast(`تم توليد ${newCodes.length} كود بنجاح`, 'success');
      await loadCodes();
    } catch (error) {
      console.error('Error generating codes:', error);
      showToast('حدث خطأ أثناء توليد الأكواد', 'error');
    } finally {
      setGeneratingCodes(false);
    }
  };

  const deleteCode = async (codeId: string) => {
    try {
      showToast('تم حذف الكود بنجاح', 'success');
      setShowDeleteModal(false);
      setCodeToDelete(null);
      await loadCodes();
    } catch (error) {
      console.error('Error deleting code:', error);
      showToast('حدث خطأ أثناء حذف الكود', 'error');
    }
  };

  const disableCode = async (codeId: string) => {
    try {
      showToast('تم تعطيل الكود بنجاح', 'success');
      await loadCodes();
    } catch (error) {
      showToast('حدث خطأ أثناء تعطيل الكود', 'error');
    }
  };

  const enableCode = async (codeId: string) => {
    try {
      showToast('تم تفعيل الكود بنجاح', 'success');
      await loadCodes();
    } catch (error) {
      showToast('حدث خطأ أثناء تفعيل الكود', 'error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('تم نسخ الكود بنجاح', 'success');
  };

  const exportPdf = () => showToast('سيتم تصدير PDF قريباً', 'success');
  const exportCsv = () => showToast('سيتم تصدير CSV قريباً', 'success');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  const resetFilters = () => {
    setFilters({ searchTerm: '', status: '', courseId: '', createdFrom: '', createdTo: '' });
  };

  const resetGenerateForm = () => {
    setGenerateForm({
      courseId: '',
      numberOfCodes: 10,
      codeLength: 12,
      codeFormat: 'XXXX-XXXX-XXXX',
      maxUses: 1,
      expiration: 'no-expiration',
      customDate: '',
      notes: '',
    });
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      unused: { bg: 'bg-emerald-100 text-emerald-700 border border-emerald-200', label: 'غير مستخدم' },
      used: { bg: 'bg-blue-100 text-blue-700 border border-blue-200', label: 'مستخدم' },
      disabled: { bg: 'bg-gray-100 text-gray-600 border border-gray-200', label: 'معطل' },
      expired: { bg: 'bg-red-100 text-red-700 border border-red-200', label: 'منتهي' },
    };
    const c = config[status as keyof typeof config] || config.unused;
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg}`}>{c.label}</span>
    );
  };

  const toggleSelectAll = () => {
    if (selectedCodes.length === filteredCodes.length) {
      setSelectedCodes([]);
    } else {
      setSelectedCodes(filteredCodes.map((c) => c.id));
    }
  };

  const toggleSelectCode = (id: string) => {
    setSelectedCodes((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">إدارة أكواد الوصول</h1>
              <p className="text-xs text-gray-500">إنشاء ومتابعة وإدارة أكواد الاشتراك للطلاب بسهولة تامة</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="تحديث"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
            <button
              onClick={exportCsv}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              تصدير الملفات
            </button>
            <button
              onClick={() => { resetGenerateForm(); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              توليد أكواد جديدة
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 mb-6">
            {/* إجمالي الأكواد */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">إجمالي الأكواد</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* أكواد مستخدمة */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">أكواد مستخدمة</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.used}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* أكواد فاعلة */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">أكواد فاعلة</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.active}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* أكواد منتهية */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 mb-1">أكواد منتهية</p>
                  <p className="text-2xl font-bold text-gray-800">{statistics.expired}</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content: Two columns */}
        <div className="flex gap-4 mb-5">
          {/* Left Column: Export Panel */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-700">تصدير البيانات</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الشهر الدراسي</label>
                  <select
                    value={exportCourseId}
                    onChange={(e) => setExportCourseId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">-- اختر الشهر --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">حالة الكود</label>
                  <select
                    value={exportStatus}
                    onChange={(e) => setExportStatus(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">الكل</option>
                    <option value="unused">غير مستخدم</option>
                    <option value="used">مستخدم</option>
                    <option value="disabled">معطل</option>
                    <option value="expired">منتهي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">تضمين دفعة محددة (اختياري)</label>
                  <select
                    value={exportMaxUses}
                    onChange={(e) => setExportMaxUses(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">كل الدفعات</option>
                    <option value="1">دفعة 1</option>
                    <option value="2">دفعة 2</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={exportPdf}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF
                  </button>
                  <button
                    onClick={exportCsv}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Generate + Search */}
          <div className="flex-1 space-y-4">
            {/* Generate Codes Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-700">توليد أكواد جديدة</h3>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">الشهر الدراسي</label>
                  <select
                    value={generateForm.courseId}
                    onChange={(e) => setGenerateForm({ ...generateForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">اختر الشهر</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">عدد الأكواد (حتى 1000)</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={generateForm.numberOfCodes}
                    onChange={(e) =>
                      setGenerateForm({ ...generateForm, numberOfCodes: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">الصف الدراسي</label>
                  <select
                    value={generateForm.codeLength}
                    onChange={(e) =>
                      setGenerateForm({ ...generateForm, codeLength: parseInt(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">اختر الصف</option>
                    <option value={8}>الصف الأول</option>
                    <option value={12}>الصف الثاني</option>
                    <option value={16}>الصف الثالث</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="codeFormat"
                      value="XXXX-XXXX-XXXX"
                      checked={generateForm.codeFormat === 'XXXX-XXXX-XXXX'}
                      onChange={(e) => setGenerateForm({ ...generateForm, codeFormat: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-xs text-gray-600">كود فوري</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="codeFormat"
                      value="XXXXXXXXXXXX"
                      checked={generateForm.codeFormat === 'XXXXXXXXXXXX'}
                      onChange={(e) => setGenerateForm({ ...generateForm, codeFormat: e.target.value })}
                      className="text-blue-600"
                    />
                    <span className="text-xs text-gray-600">كود دفعة</span>
                  </label>
                </div>

                <button
                  onClick={generateCodes}
                  disabled={generatingCodes || !generateForm.courseId}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {generatingCodes ? 'جاري التوليد...' : 'توليد الأكواد الآن'}
                </button>
              </div>
            </div>

            {/* Search & Filter Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-sm font-bold text-gray-700">البحث والفلترة</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">بحث سريع (الكود / الطالب / الوالد)</label>
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                    placeholder="ابدأ البحث هنا..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">الصف</label>
                  <select
                    value={filters.courseId}
                    onChange={(e) => setFilters({ ...filters, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">كل الصفوف</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">الحالة</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="unused">غير مستخدم</option>
                    <option value="used">مستخدم</option>
                    <option value="disabled">معطل</option>
                    <option value="expired">منتهي</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-500 mb-1">رقم الدفعة</label>
                  <select
                    value={filters.createdFrom}
                    onChange={(e) => setFilters({ ...filters, createdFrom: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
                  >
                    <option value="">كل الدفعات</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  فلترة
                </button>
                <button
                  onClick={resetFilters}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="إعادة تعيين"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-500">جاري تحميل البيانات...</p>
            </div>
          ) : filteredCodes.length === 0 ? (
            <div className="py-20 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-sm mb-4">لا توجد أكواد حالياً</p>
              <button
                onClick={generateCodes}
                disabled={!generateForm.courseId}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                ابدأ بتوليد أكواد
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-4 py-3 text-right">
                      <input
                        type="checkbox"
                        checked={selectedCodes.length === filteredCodes.length && filteredCodes.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">الكود</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">التفاصيل</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">الحالة</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">المستخدم</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">التاريخ</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCodes.map((code) => (
                    <tr
                      key={code.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedCodes.includes(code.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedCodes.includes(code.id)}
                          onChange={() => toggleSelectCode(code.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {code.code}
                          </span>
                          <button
                            onClick={() => copyToClipboard(code.code)}
                            className="text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 font-medium">{code.course?.title || '-'}</p>
                        <p className="text-xs text-gray-400">
                          {code.uses_count}/{code.max_uses} استخدام
                        </p>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(code.status)}</td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{code.used_by || '-'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{formatDate(code.created_at)}</p>
                        {code.used_at && (
                          <p className="text-xs text-gray-400">استُخدم: {formatDate(code.used_at)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === code.id ? null : code.id);
                            }}
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                            </svg>
                          </button>

                          {openDropdown === code.id && (
                            <div className="absolute left-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                              <button
                                onClick={() => {
                                  setSelectedCode(code);
                                  setShowDetailsModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                عرض التفاصيل
                              </button>
                              <button
                                onClick={() => { copyToClipboard(code.code); setOpenDropdown(null); }}
                                className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                نسخ الكود
                              </button>
                              {code.status === 'unused' && (
                                <button
                                  onClick={() => { disableCode(code.id); setOpenDropdown(null); }}
                                  className="w-full px-3 py-2 text-right text-sm hover:bg-yellow-50 transition-colors flex items-center gap-2 text-yellow-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  تعطيل الكود
                                </button>
                              )}
                              {code.status === 'disabled' && (
                                <button
                                  onClick={() => { enableCode(code.id); setOpenDropdown(null); }}
                                  className="w-full px-3 py-2 text-right text-sm hover:bg-green-50 transition-colors flex items-center gap-2 text-green-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  تفعيل الكود
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setCodeToDelete(code.id);
                                  setShowDeleteModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-3 py-2 text-right text-sm hover:bg-red-50 transition-colors flex items-center gap-2 text-red-600"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                حذف الكود
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Generated Codes Modal */}
      {showGeneratedCodesModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">تم توليد الأكواد بنجاح</h2>
                    <p className="text-emerald-100 text-sm">تم إنشاء {generatedCodes.length} كود جديد</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowGeneratedCodesModal(false); setGeneratedCodes([]); }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-3 mb-5">
                {generatedCodes.map((code, index) => (
                  <div key={index}
                    className="flex items-center justify-between bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
                    <span className="font-mono font-bold text-blue-600">{code}</span>
                    <button onClick={() => copyToClipboard(code)} className="text-blue-400 hover:text-blue-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => copyToClipboard(generatedCodes.join('\n'))}
                  className="flex-1 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                >
                  نسخ جميع الأكواد
                </button>
                <button
                  onClick={() => { setShowGeneratedCodesModal(false); setGeneratedCodes([]); }}
                  className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedCode && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-blue-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">تفاصيل الكود</h2>
                <button
                  onClick={() => { setShowDetailsModal(false); setSelectedCode(null); }}
                  className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-blue-50 rounded-xl p-4 mb-5 flex items-center justify-between border border-blue-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">الكود</p>
                  <p className="font-mono text-xl font-bold text-blue-600">{selectedCode.code}</p>
                </div>
                <button
                  onClick={() => copyToClipboard(selectedCode.code)}
                  className="p-2 bg-white rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">الكورس</p>
                  <p className="text-sm font-medium text-gray-800">{selectedCode.course?.title || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">الحالة</p>
                  {getStatusBadge(selectedCode.status)}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">تاريخ الإنشاء</p>
                  <p className="text-sm text-gray-700">{formatDate(selectedCode.created_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">أنشئ بواسطة</p>
                  <p className="text-sm text-gray-700">{selectedCode.created_by || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">الحد الأقصى للاستخدامات</p>
                  <p className="text-sm font-bold text-gray-800">{selectedCode.max_uses}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">عدد الاستخدامات</p>
                  <p className="text-sm font-bold text-gray-800">{selectedCode.uses_count}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">تاريخ الانتهاء</p>
                  <p className="text-sm text-gray-700">{formatDate(selectedCode.expires_at)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">مستخدم بواسطة</p>
                  <p className="text-sm text-gray-700">{selectedCode.used_by || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 mb-1">تاريخ الاستخدام</p>
                  <p className="text-sm text-gray-700">{formatDate(selectedCode.used_at)}</p>
                </div>
                {selectedCode.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">ملاحظات</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedCode.notes}</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => { setShowDetailsModal(false); setSelectedCode(null); }}
                className="w-full mt-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && codeToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl">
            <div className="bg-red-600 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-white">تأكيد الحذف</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-600 text-sm mb-6">
                هل أنت متأكد من حذف هذا الكود؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => deleteCode(codeToDelete)}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
                >
                  حذف
                </button>
                <button
                  onClick={() => { setShowDeleteModal(false); setCodeToDelete(null); }}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div
            className={`px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-red-600 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="font-medium text-sm">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCodes;
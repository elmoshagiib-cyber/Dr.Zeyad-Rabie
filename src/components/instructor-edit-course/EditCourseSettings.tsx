import type { Course } from "../../pages/instructor/EditCourse";

type Props = {
  course: Course;
  updateCourseField: <K extends keyof Course>(field: K, value: Course[K]) => void;

  thumbnailPreview: string;
  thumbnailFile: File | null;

  thumbnailUploading: boolean;
  thumbnailUploadProgress: number;

  setThumbnailPreview: (value: string) => void;
  setThumbnailFile: (value: File | null) => void;

  handleThumbnailChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onOpenDeleteModal: () => void;
};

export function EditCourseSettings({
  course,
  updateCourseField,
  thumbnailPreview,
  thumbnailFile,
  thumbnailUploading,
  thumbnailUploadProgress,
  setThumbnailPreview,
  setThumbnailFile,
  handleThumbnailChange,
  onOpenDeleteModal,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-800">المعلومات الأساسية</h3>
          <p className="text-sm text-slate-500 mt-0.5">تعديل بيانات الدورة الرئيسية</p>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الدورة</label>
            <input
              type="text"
              value={course.title}
              onChange={(e) => updateCourseField("title", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors"
              placeholder="أدخل عنوان الدورة"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">وصف الدورة</label>
            <textarea
              value={course.description}
              onChange={(e) => updateCourseField("description", e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors resize-none"
              placeholder="اكتب وصفاً شاملاً للدورة..."
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">الصف الدراسي / المرحلة</label>
            <select
              value={course.grade}
              onChange={(e) => updateCourseField("grade", e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50"
            >
              <option value="">اختر المرحلة الدراسية</option>
              <option value="prep_1">الصف الأول الإعدادي</option>
              <option value="prep_2">الصف الثاني الإعدادي</option>
              <option value="prep_3">الصف الثالث الإعدادي</option>
              <option value="sec_1">الصف الأول الثانوي</option>
              <option value="sec_2">الصف الثاني الثانوي</option>
              <option value="sec_3">الصف الثالث الثانوي</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-800">التسعير</h3>
          <p className="text-sm text-slate-500 mt-0.5">تحديد سعر الدورة أو جعلها مجانية</p>
        </div>
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">دورة مجانية</p>
              <p className="text-xs text-slate-500 mt-0.5">إتاحة الدورة مجاناً لجميع الطلاب</p>
            </div>
            <div
              onClick={() => updateCourseField("isFree", !course.isFree)}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${course.isFree ? "bg-emerald-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.isFree ? "-translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>
          {!course.isFree && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">السعر (بالجنيه المصري)</label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={course.price}
                  onChange={(e) => updateCourseField("price", Number(e.target.value))}
                  className="w-full pl-4 pr-16 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors"
                  placeholder="0"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">ج.م</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thumbnail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-800">صورة الدورة</h3>
          <p className="text-sm text-slate-500 mt-0.5">الصورة المصغرة للدورة في القوائم</p>
        </div>
        <div className="p-6">
          <div className="flex gap-6 items-start">
{thumbnailUploading ? (
  <div className="w-40 h-28 p-4 border border-blue-200 rounded-2xl bg-blue-50 flex-shrink-0 space-y-2.5">
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5 text-blue-700 font-medium">
        <svg
          className="w-3.5 h-3.5 animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>

        جاري الرفع...
      </div>

      <span className="text-blue-600 font-bold">
        {thumbnailUploadProgress || 0}%
      </span>
    </div>

    <div className="w-full bg-blue-200 rounded-full h-1.5 overflow-hidden">
      <div
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-200"
        style={{
          width: `${thumbnailUploadProgress || 0}%`,
        }}
      />
    </div>
  </div>
) : thumbnailPreview ? (
  <div className="relative flex-shrink-0">
    <img
      src={thumbnailPreview}
      alt="thumbnail"
      className="w-40 h-28 object-cover rounded-2xl border border-slate-200 shadow-sm"
    />

    <button
      onClick={() => {
        setThumbnailPreview("");
        setThumbnailFile(null);
      }}
      className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow hover:bg-red-600 transition-colors"
      type="button"
    >
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
) : (
  <div className="w-40 h-28 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 flex-shrink-0">
    <svg
      className="w-10 h-10"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 00-2 2H6a2 2 0 00-2-2V6a2 2 0 002-2h12a2 2 0 002 2v12a2 2 0 00-2 2z"
      />
    </svg>
  </div>
)}
            <div className="flex-1 space-y-3">
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 transition-all group">
                <div className="flex flex-col items-center gap-1 text-slate-400 group-hover:text-indigo-500 transition-colors">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-sm font-medium">{thumbnailPreview ? "تغيير الصورة" : "رفع صورة الدورة"}</span>
                  <span className="text-xs">PNG, JPG — الحجم الموصى به 1280×720</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailChange} />
              </label>
              {thumbnailFile && (
                <p className="text-xs text-slate-500">تم اختيار: {thumbnailFile.name}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Visibility Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-800">حالة النشر والظهور</h3>
          <p className="text-sm text-slate-500 mt-0.5">التحكم في نشر الدورة وإخفائها</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">نشر الدورة</p>
              <p className="text-xs text-slate-500 mt-0.5">جعل الدورة متاحة للطلاب</p>
            </div>
            <div
              onClick={() => updateCourseField("published", !course.published)}
              className={`relative w-12 h-6 rounded-full cursor-pointer transition-colors duration-200 ${course.published ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.published ? "-translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Access Control Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-l from-slate-50 to-white">
          <h3 className="text-base font-bold text-slate-800">التحكم في الوصول</h3>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              حالة المحاضرة <span className="text-red-500">*</span>
            </label>
            <select
              value={course.contentStatus}
              onChange={(e) =>
                updateCourseField("contentStatus", e.target.value as Course["contentStatus"])
              }
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50"
            >
              <option value="draft">مسودة (Draft)</option>
              <option value="published">منشور (Published)</option>
              <option value="archived">مؤرشف (Archived)</option>
            </select>
            <p className="text-xs text-slate-400 mt-1.5">تحل محل مفتاح تفعيل المحاضرة فورًا.</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">تفعيل العلامة المائية (Dynamic Watermark)</p>
              <p className="text-xs text-slate-500 mt-0.5">إظهار رقم هاتف الطالب واسمه بشكل متحرك على الفيديوهات وملفات الـ PDF لمنع السرقة.</p>
            </div>
            <div
              onClick={() => updateCourseField("watermarkEnabled", !course.watermarkEnabled)}
              className={`relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors duration-200 ${course.watermarkEnabled ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.watermarkEnabled ? "-translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">تفعيل تتبع المشاهدة والتسلسل</p>
              <p className="text-xs text-slate-500 mt-0.5">ربط الفيديو بنظام إكمال المحاضرات ومنع الانتقال.</p>
            </div>
            <div
              onClick={() => updateCourseField("sequentialViewingEnabled", !course.sequentialViewingEnabled)}
              className={`relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors duration-200 ${course.sequentialViewingEnabled ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.sequentialViewingEnabled ? "-translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-300 transition-colors">
            <div>
              <p className="text-sm font-semibold text-slate-800">السماح للطالب بتحميل المرفقات</p>
              <p className="text-xs text-slate-500 mt-0.5">منح حق تنزيل ملفات الـ PDF وطباعتها.</p>
            </div>
            <div
              onClick={() => updateCourseField("allowAttachmentDownload", !course.allowAttachmentDownload)}
              className={`relative w-12 h-6 rounded-full cursor-pointer flex-shrink-0 transition-colors duration-200 ${course.allowAttachmentDownload ? "bg-indigo-600" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${course.allowAttachmentDownload ? "-translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              إجبار الطالب على استكمال نسبة المشاهدة (%)
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={course.minWatchPercentage}
              onChange={(e) => updateCourseField("minWatchPercentage", Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-slate-800 bg-slate-50"
              placeholder="0"
            />
            <p className="text-xs text-slate-400 mt-1.5">القيمة 0 تعني تجاوز هذه القاعدة.</p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border-2 border-red-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 bg-red-50">
          <h3 className="text-base font-bold text-red-700">منطقة الخطر</h3>
          <p className="text-sm text-red-500 mt-0.5">الإجراءات التالية لا يمكن التراجع عنها</p>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">حذف الدورة نهائياً</p>
              <p className="text-xs text-slate-500 mt-0.5">سيتم حذف جميع محتويات الدورة بشكل دائم</p>
            </div>
            <button
              onClick={onOpenDeleteModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600 font-semibold text-sm border-2 border-red-200 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              حذف الدورة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
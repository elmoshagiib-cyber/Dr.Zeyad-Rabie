import type { PdfItem } from "../../pages/instructor/EditCourse";
import { formatFileSize } from "../../pages/instructor/EditCourse";

type Props = {
  sectionId: string;
  item: PdfItem;
  itemIndex: number;
  totalItems: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<PdfItem>) => void;
  onUploadFile: (file: File) => void;
};

export function EditCoursePdfItem({
  item,
  itemIndex,
  totalItems,
  collapsed,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
  onUploadFile,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-rose-50 to-transparent border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-rose-50 text-rose-700 border-rose-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            PDF
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            title="إظهار / إخفاء"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? "" : "rotate-180"}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button onClick={onMoveUp} disabled={itemIndex === 0} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
          </button>
          <button onClick={onMoveDown} disabled={itemIndex === totalItems - 1} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button onClick={onRemove} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الملف</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
              placeholder="أدخل عنوان الملف"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">الوصف</label>
            <textarea
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm resize-none"
              placeholder="وصف مختصر للملف"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">رفع ملف PDF</label>
            {item.status === "idle" || item.status === "error" ? (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer bg-slate-50 hover:bg-rose-50 hover:border-rose-400 transition-all group">
                <div className="flex flex-col items-center gap-2 text-slate-400 group-hover:text-rose-500 transition-colors">
                  <svg className="w-9 h-9" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <span className="text-sm font-medium">اسحب ملف PDF هنا أو انقر للرفع</span>
                </div>
                <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUploadFile(file);
                }} />
              </label>
            ) : item.status === "uploading" ? (
              <div className="w-full p-5 border border-rose-200 rounded-2xl bg-rose-50 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-rose-700 font-medium">جاري الرفع...</span>
                  <span className="text-rose-600 font-bold">{item.uploadProgress}%</span>
                </div>
                <div className="w-full bg-rose-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-rose-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${item.uploadProgress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-rose-600">
                  <span className="truncate">{item.fileName}</span>
                  <span className="flex-shrink-0 mr-2 font-medium">
                    {formatFileSize(item.uploadedBytes)} / {formatFileSize(item.totalBytes)}
                  </span>
                </div>
                <p className="text-xs text-rose-500">
                  متبقي: {formatFileSize(item.totalBytes - item.uploadedBytes)}
                </p>
              </div>
            ) : (
              <div className="w-full p-4 border border-emerald-200 rounded-2xl bg-emerald-50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-emerald-800 truncate">{item.fileName}</p>
                  <p className="text-xs text-emerald-600">{formatFileSize(item.fileSize)}</p>
                </div>
                <label className="text-xs text-emerald-600 hover:text-emerald-800 cursor-pointer underline underline-offset-2 font-medium">
                  تغيير
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUploadFile(file);
                  }} />
                </label>
              </div>
            )}
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <div
              onClick={() => onUpdate({ allowDownload: !item.allowDownload })}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${item.allowDownload ? "bg-rose-500" : "bg-slate-300"}`}
            >
              <span className={`absolute top-0.5 right-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${item.allowDownload ? "-translate-x-5" : "translate-x-0"}`} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">السماح بتحميل الملف</span>
          </label>
        </div>
      )}
    </div>
  );
}
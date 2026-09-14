import type { LinkItem } from "../../pages/instructor/EditCourse";

type Props = {
  sectionId: string;
  item: LinkItem;
  itemIndex: number;
  totalItems: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<LinkItem>) => void;
};

export function EditCourseLinkItem({
  item,
  itemIndex,
  totalItems,
  collapsed,
  onToggleCollapse,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-l from-cyan-50 to-transparent border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-cyan-50 text-cyan-700 border-cyan-200">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-3 3a4 4 0 01-5.656-5.656l1.5-1.5M10.172 13.828a4 4 0 010-5.656l3-3a4 4 0 015.656 5.656l-1.5 1.5" /></svg>
            رابط
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
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">عنوان الرابط</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
              placeholder="أدخل عنوان الرابط"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">الوصف</label>
            <textarea
              value={item.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm resize-none"
              placeholder="وصف مختصر للرابط"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">رابط URL</label>
            <input
              type="url"
              value={item.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-800 bg-slate-50 hover:bg-white transition-colors text-sm"
              placeholder="https://example.com"
            />
          </div>
        </div>
      )}
    </div>
  );
}
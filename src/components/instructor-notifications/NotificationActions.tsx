import {
  Send,
  History,
  Trash2,
} from "lucide-react";

type Props = {
  onSend: () => void;
  onHistory: () => void;
  onDeleteAll: () => void;
};

export function NotificationActions({
  onSend,
  onHistory,
  onDeleteAll,
}: Props) {
  return (
    <div
      className="
      mt-8
      flex
      flex-wrap
      items-center
      gap-4
      rounded-3xl
      border
      border-slate-200
      bg-white
      p-5
      shadow-sm
      "
    >

      <button
        onClick={onSend}
        className="
        flex
        items-center
        gap-2
        rounded-2xl
        bg-[#4C1D95]
        px-6
        py-3
        font-bold
        text-white
        transition
        hover:scale-105
        "
      >
        <Send size={18}/>
        إرسال إشعار
      </button>

      <button
        onClick={onHistory}
        className="
        flex
        items-center
        gap-2
        rounded-2xl
        border
        border-slate-200
        bg-white
        px-6
        py-3
        font-semibold
        transition
        hover:bg-slate-50
        "
      >
        <History size={18}/>
        سجل الإشعارات
      </button>

      <button
        onClick={onDeleteAll}
        className="
        mr-auto
        flex
        items-center
        gap-2
        rounded-2xl
        bg-red-50
        px-6
        py-3
        font-semibold
        text-red-600
        transition
        hover:bg-red-100
        "
      >
        <Trash2 size={18}/>
        حذف الكل
      </button>

    </div>
  );
}
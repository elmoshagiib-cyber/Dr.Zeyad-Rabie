import {
  Bell,
  Send,
  History,
} from "lucide-react";

type Props = {
  total: number;
  today: number;
  unread: number;
  onSend: () => void;
  onHistory: () => void;
};

export function NotificationsHero({
  total,
  today,
  unread,
  onSend,
  onHistory,
}: Props) {
  return (
    <div
      className="
      relative
      overflow-hidden
      rounded-[32px]
      bg-[#4C1D95]
      p-10
      text-white
      shadow-xl
      "
    >
      <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

        <div>

          <h1 className="text-5xl font-black">
            إدارة الإشعارات
          </h1>

          <p className="mt-4 text-lg text-violet-100 max-w-xl">
            إرسال وإدارة جميع إشعارات الطلاب داخل المنصة من مكان واحد.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">

            <button
              onClick={onSend}
              className="
              h-14
              rounded-2xl
              bg-white
              px-7
              font-bold
              text-violet-700
              transition
              hover:scale-105
              "
            >
              <div className="flex items-center gap-2">
                <Send size={18}/>
                إرسال إشعار
              </div>
            </button>

            <button
              onClick={onHistory}
              className="
              h-14
              rounded-2xl
              border
              border-white/20
              bg-white/10
              px-7
              backdrop-blur
              transition
              hover:bg-white/20
              "
            >
              <div className="flex items-center gap-2">
                <History size={18}/>
                سجل الإشعارات
              </div>
            </button>

          </div>

        </div>


      </div>
    </div>
  );
}

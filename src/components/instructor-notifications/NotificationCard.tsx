import {
  Bell,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Trash2,
  Clock3,
} from "lucide-react";

type Props = {
  notification: any;
  onDelete: (id: number) => void;
};

export function NotificationCard({
  notification,
  onDelete,
}: Props) {

  const types = {

    "عام": {
      color: "bg-violet-100 text-violet-700",
      icon: Bell,
    },

    "محاضرة": {
      color: "bg-blue-100 text-blue-700",
      icon: GraduationCap,
    },

    "واجب": {
      color: "bg-orange-100 text-orange-700",
      icon: AlertCircle,
    },

    "امتحان": {
      color: "bg-red-100 text-red-700",
      icon: CheckCircle,
    },

  };

  const current =
    types[
      notification.type as keyof typeof types
    ] || types["عام"];

  const Icon = current.icon;

  return (

    <div
      className="
      rounded-[28px]
      border
      border-slate-200
      bg-white
      p-6
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-lg
      "
    >

      <div className="flex items-start justify-between">

        <div
          className={`
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-2xl
          ${current.color}
          `}
        >
          <Icon size={22} />
        </div>

        <button
          onClick={() =>
            onDelete(notification.id)
          }
          className="
          rounded-xl
          p-2
          text-slate-400
          transition
          hover:bg-red-50
          hover:text-red-600
          "
        >
          <Trash2 size={18}/>
        </button>

      </div>

      <h2
        className="
        mt-5
        text-xl
        font-black
        text-slate-800
        "
      >
        {notification.title}
      </h2>

      <p
        className="
        mt-3
        leading-7
        text-slate-500
        "
      >
        {notification.content}
      </p>

      <div
        className="
        mt-6
        flex
        flex-wrap
        gap-3
        "
      >

        <span
          className="
          rounded-full
          bg-violet-100
          px-4
          py-2
          text-sm
          font-semibold
          text-violet-700
          "
        >
          {notification.target_grade}
        </span>

        <span
          className="
          rounded-full
          bg-slate-100
          px-4
          py-2
          text-sm
          text-slate-600
          "
        >
          {notification.type}
        </span>

      </div>

      <div
        className="
        mt-6
        flex
        items-center
        gap-2
        text-sm
        text-slate-400
        "
      >

        <Clock3 size={16}/>

        {new Date(
          notification.created_at
        ).toLocaleString("ar-EG")}

      </div>

    </div>

  );

}
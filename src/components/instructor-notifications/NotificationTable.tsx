import { Bell } from "lucide-react";
import { NotificationCard } from "./NotificationCard";

type Props = {
  notifications: any[];
  onDelete: (id: number) => void;
};

export function NotificationTable({
  notifications,
  onDelete,
}: Props) {

  return (

    <div
      id="notifications-table"
      className="
      mt-8
      grid
      gap-6
      lg:grid-cols-2
      2xl:grid-cols-3
      "
    >

      {notifications.length > 0 ? (

        notifications.map((notification) => (

          <NotificationCard
            key={notification.id}
            notification={notification}
            onDelete={onDelete}
          />

        ))

      ) : (

        <div
          className="
          col-span-full
          rounded-[32px]
          border
          border-dashed
          border-slate-300
          bg-white
          py-24
          text-center
          shadow-sm
          "
        >

          <Bell
            size={60}
            className="mx-auto text-slate-300"
          />

          <h2 className="mt-6 text-2xl font-black text-slate-700">

            لا توجد إشعارات

          </h2>

          <p className="mt-3 text-slate-500">

            لم يتم إرسال أي إشعار حتى الآن.

          </p>

        </div>

      )}

    </div>

  );

}
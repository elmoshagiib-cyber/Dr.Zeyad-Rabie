import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SendNotificationModal({
  open,
  onClose,
}: Props) {

  if (!open) return null;

  return (

    <div
      className="
      fixed
      inset-0
      z-[100]
      flex
      items-center
      justify-center
      bg-black/40
      backdrop-blur-sm
      "
    >

      <div
        className="
        w-full
        max-w-4xl
        rounded-[32px]
        bg-white
        shadow-2xl
        "
      >

        {/* Header */}

        <div
          className="
          flex
          items-center
          justify-between
          border-b
          border-slate-200
          p-6
          "
        >

          <h2 className="text-3xl font-black">

            إرسال إشعار جديد

          </h2>

          <button
            onClick={onClose}
            className="
            rounded-xl
            p-2
            hover:bg-slate-100
            "
          >

            <X size={22}/>

          </button>

        </div>

        {/* Body */}

        <div className="p-8">

          هنا هنبني الفورم

        </div>

      </div>

    </div>

  );

}
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, X } from "lucide-react";
import { Button } from "../../ui/Button";
import { supabase } from "../../../lib/supabase";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function ParentAccessModal({ open, onClose }: Props) {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async () => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) {
      setError("من فضلك أدخل رقم هاتفك المسجل كولي أمر");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: rpcError } = await supabase.rpc("get_parent_dashboard", {
        p_parent_phone: cleanPhone,
      });

      if (rpcError || !data || data.length === 0) {
        setError("لم يتم العثور على أي طالب مسجل بهذا الرقم");
        setLoading(false);
        return;
      }

      sessionStorage.setItem("parent_phone", cleanPhone);
      sessionStorage.setItem("parent_students", JSON.stringify(data));

      setLoading(false);
      setPhone("");
      onClose();
      navigate("/parent-dashboard");
    } catch (err) {
      setError("حدث خطأ في الاتصال بالسيرفر، حاول مرة أخرى");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="w-full max-w-md rounded-[30px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-[#2A2A2A] shadow-[0_25px_70px_rgba(15,23,42,.12)] dark:shadow-[0_30px_70px_rgba(0,0,0,.65)] p-8 animate-in zoom-in-95 duration-300 relative">
        <button
          onClick={onClose}
          className="absolute top-5 left-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6EEFF] dark:bg-[#2B103D]">
            <Users size={36} className="text-[#B348FE]" />
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            لوحة تحكم ولي الأمر
          </h2>

          <p className="mt-3 text-gray-500 dark:text-gray-400 text-[15px] leading-7">
            أدخل رقم هاتفك المسجل كولي أمر لمتابعة بيانات ابنك على المنصة.
          </p>
        </div>

        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
          dir="ltr"
          className="mt-7 w-full rounded-2xl border border-gray-200 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#181818] px-5 py-4 text-center text-lg tracking-[3px] font-black text-[#B348FE] outline-none transition-all duration-300 focus:border-[#B348FE] focus:ring-4 focus:ring-[#B348FE]/20"
        />

        {error && (
          <p className="mt-3 text-center text-sm font-bold text-red-500">{error}</p>
        )}

        <Button
          className="w-full mt-5 bg-[#B348FE] hover:bg-[#9E2FFF] text-white"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "جاري البحث..." : "دخول لمتابعة ابني"}
        </Button>

        <Button
          variant="ghost"
          className="w-full mt-3 text-gray-500 dark:text-gray-400 hover:text-[#B348FE]"
          onClick={onClose}
        >
          إلغاء
        </Button>
      </div>
    </div>
  );
}
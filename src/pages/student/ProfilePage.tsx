import { useState, useRef, useEffect } from "react";
import { Camera, Edit2, CheckCircle, Star, Trophy, BookOpen, Award, Shield, Lock, Eye, EyeOff, Loader2, ChevronDown, Receipt } from "lucide-react";import StudentLayout from "./StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Avatar } from "../../components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { CURRENT_STUDENT, COURSES, LEADERBOARD } from "../../data/mockData";
import { supabase } from "../../lib/supabase";

interface SubCourseInfo {
  id: string;
  title: string;
}

interface StudentSubscriptionPayment {
  id: number;
  invoice_number: string;
  student_type: "online" | "center";
  amount: number;
  payment_method: "vodafone_cash" | "instapay";
  payment_status: "pending" | "verified" | "rejected" | "cancelled";
  subscription_start_date: string;
  subscription_end_date: string;
  subscription_code: string | null;
  created_at: string;
  courseData?: SubCourseInfo;
}

function ImageCropModal({  file,
  aspect,
  shape = "rect",
  onCancel,
  onCropped,
}: {
  file: File;
  aspect: number;
  shape?: "rect" | "circle";
  onCancel: () => void;
  onCropped: (blob: Blob) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragState = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [viewW, setViewW] = useState(320);

  const viewH = Math.round(viewW / aspect);

  useEffect(() => {
    const computeWidth = () => {
      const screenW = window.innerWidth;
      const maxModalWidth = Math.min(screenW - 32, 420) - 40;
      const w = Math.max(200, Math.min(360, maxModalWidth));
      setViewW(w);
    };
    computeWidth();
    window.addEventListener("resize", computeWidth);
    return () => window.removeEventListener("resize", computeWidth);
  }, []);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      const s = Math.max(viewW / img.width, viewH / img.height);
      setMinScale(s);
      setScale(s);
      setOffset({ x: 0, y: 0 });
      setImgLoaded(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, viewW]);

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, offset, imgLoaded, viewW]);

  const draw = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    canvas.width = viewW;
    canvas.height = viewH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, viewW, viewH);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (viewW - w) / 2 + offset.x, (viewH - h) / 2 + offset.y, w, h);
  };

  const clamp = (o: { x: number; y: number }, s: number) => {
    const img = imgRef.current;
    if (!img) return o;
    const w = img.width * s;
    const h = img.height * s;
    const maxX = Math.max(0, (w - viewW) / 2);
    const maxY = Math.max(0, (h - viewH) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, o.x)), y: Math.min(maxY, Math.max(-maxY, o.y)) };
  };

  const down = (e: React.MouseEvent | React.TouchEvent) => {
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    dragState.current = { x: p.clientX, y: p.clientY, offset };
  };
  const move = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragState.current) return;
    const p = "touches" in e ? e.touches[0] : (e as React.MouseEvent);
    const dx = p.clientX - dragState.current.x;
    const dy = p.clientY - dragState.current.y;
    setOffset(clamp({ x: dragState.current.offset.x + dx, y: dragState.current.offset.y + dy }, scale));
  };
  const up = () => {
    dragState.current = null;
  };

  const zoom = (v: string) => {
    const s = Number(v);
    setScale(s);
    setOffset((o) => clamp(o, s));
  };

  const confirm = () => {
    const OUT_W = aspect >= 2 ? 1200 : 800;
    const OUT_H = Math.round(OUT_W / aspect);
    const out = document.createElement("canvas");
    out.width = OUT_W;
    out.height = OUT_H;
    const ctx = out.getContext("2d");
    const img = imgRef.current;
    if (!ctx || !img) return;
    const r = OUT_W / viewW;
    const w = img.width * scale * r;
    const h = img.height * scale * r;
    ctx.drawImage(img, (OUT_W - w) / 2 + offset.x * r, (OUT_H - h) / 2 + offset.y * r, w, h);
    out.toBlob(
      (blob) => {
        if (blob) onCropped(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-3 sm:p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-[420px] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
          <h3 className="font-black text-gray-900 dark:text-white text-base sm:text-lg">اقصص الصورة</h3>
        </div>
        <div className="p-4 sm:p-5 flex flex-col items-center gap-3 sm:gap-4">
          <div
            className={`relative overflow-hidden touch-none select-none bg-gray-100 dark:bg-[#1A1A1A] ${
              shape === "circle" ? "rounded-full" : "rounded-xl sm:rounded-2xl"
            }`}
            style={{ width: viewW, height: viewH }}
            onMouseDown={down}
            onMouseMove={move}
            onMouseUp={up}
            onMouseLeave={up}
            onTouchStart={down}
            onTouchMove={move}
            onTouchEnd={up}
          >
            <canvas ref={canvasRef} className="w-full h-full cursor-move" />
          </div>

          {imgLoaded && (
            <div className="w-full flex items-center gap-2 sm:gap-3">
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold whitespace-nowrap">تصغير</span>
              <input
                type="range"
                min={minScale}
                max={minScale * 3}
                step={0.01}
                value={scale}
                onChange={(e) => zoom(e.target.value)}
                className="flex-1 accent-[#B348FE]"
              />
              <span className="text-[11px] sm:text-xs text-gray-400 font-bold whitespace-nowrap">تكبير</span>
            </div>
          )}
        </div>
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-[#2A2A2A] flex gap-2.5 sm:gap-3">
          <Button onClick={confirm} className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl h-11 sm:h-12 font-black text-sm">
            حفظ
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-11 sm:h-12 font-black text-sm">
            إلغاء
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { user, updateUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || CURRENT_STUDENT.name);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const enrolledCourses = CURRENT_STUDENT.enrolledCourses.map(ec => ({
    ...ec,
    course: COURSES.find(c => c.id === ec.courseId),
  }));

  const myRank = LEADERBOARD.find(l => l.rank === 12);

  const achievements = [
    { icon: "🏆", title: "متفوق", desc: "حصلت على 90%+ في 3 اختبارات", earned: true },
    { icon: "🔥", title: "مثابر", desc: "7 أيام متواصلة في الدراسة", earned: true },
    { icon: "📚", title: "قارئ نشط", desc: "شاهدت 20 درس هذا الأسبوع", earned: true },
    { icon: "⭐", title: "متميز", desc: "ترتيب ضمن أفضل 10 طلاب", earned: false },
    { icon: "🎯", title: "دقيق", desc: "أجبت صح على 50 سؤال متتالي", earned: false },
    { icon: "🚀", title: "سريع التعلم", desc: "أتممت كورس في أسبوع واحد", earned: false },
  ];

  const displayUser: any = user || {
    name: CURRENT_STUDENT.name,
    code: CURRENT_STUDENT.code,
    grade: CURRENT_STUDENT.grade,
    gradeLabel: CURRENT_STUDENT.gradeLabel,
    governorate: CURRENT_STUDENT.governorate,
    phone: CURRENT_STUDENT.phone,
  };

  const [avatarUrl, setAvatarUrl] = useState(displayUser.avatar_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [cropFile, setCropFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateImageFile = (file: File) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("حجم الصورة يجب ألا يتجاوز 5MB");
      return false;
    }
    return true;
  };

  const onAvatarFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) return;
    setCropFile(file);
  };

  const uploadAvatarBlob = async (blob: Blob) => {
    try {
      setUploadingAvatar(true);

      if (!user?.id) {
        alert("يجب تسجيل الدخول أولاً");
        return;
      }

      const filePath = `${user.id}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const avatar = `${data.publicUrl}?t=${Date.now()}`;

      const { error } = await supabase
        .from("students")
        .update({ avatar_url: avatar })
        .eq("auth_id", user.id);

      if (error) throw error;

      setAvatarUrl(avatar);
      updateUser({ avatar_url: avatar });

      alert("تم تحديث الصورة بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع الصورة");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };



  const handleCropped = (blob: Blob) => {
    uploadAvatarBlob(blob);
    setCropFile(null);
  };

 const handleCropCancel = () => {
    setCropFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [subscriptionPayments, setSubscriptionPayments] = useState<StudentSubscriptionPayment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      if (!user?.id) {
        setLoadingPayments(false);
        return;
      }
      setLoadingPayments(true);

      const { data: studentRow } = await supabase
        .from("students")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      if (!studentRow) {
        setLoadingPayments(false);
        return;
      }

      const { data, error } = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("student_id", studentRow.id)
        .order("created_at", { ascending: false });

      if (error || !data) {
        setLoadingPayments(false);
        return;
      }

      const courseIds = [...new Set(data.map((p: any) => p.course_id))];
      const { data: coursesData } = courseIds.length
        ? await supabase.from("courses").select("id, title").in("id", courseIds)
        : { data: [] as any[] };

      const merged = data.map((p: any) => ({
        ...p,
        courseData: coursesData?.find((c: any) => c.id === p.course_id),
      }));

      setSubscriptionPayments(merged as StudentSubscriptionPayment[]);
      setLoadingPayments(false);
    };

    loadPayments();
  }, [user?.id]);

  const paymentStatusBadge = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "قيد المراجعة", className: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" },
      verified: { label: "تم التأكيد", className: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" },
      rejected: { label: "مرفوض", className: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" },
      cancelled: { label: "ملغي", className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
    };
    const conf = map[status] || map.pending;
    return (
      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black whitespace-nowrap ${conf.className}`}>
        {conf.label}
      </span>
    );
  };

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const passwordStrength = () => {
    const p = newPassword;
    if (!p) return null;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: "ضعيفة", color: "#ef4444", width: "25%" };
    if (s === 2) return { label: "متوسطة", color: "#f59e0b", width: "55%" };
    if (s === 3) return { label: "جيدة", color: "#3b82f6", width: "75%" };
    return { label: "قوية جداً", color: "#22c55e", width: "100%" };
  };

  const strength = passwordStrength();

  const handleChangePassword = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("كلمتا المرور غير متطابقتين");
      return;
    }

    setPasswordLoading(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setPasswordError("حدث خطأ أثناء تحديث كلمة المرور، حاول مرة أخرى");
      setPasswordLoading(false);
      return;
    }

    setPasswordSuccess(true);
    setNewPassword("");
    setConfirmPassword("");
    setPasswordLoading(false);

    setTimeout(() => setPasswordSuccess(false), 4000);
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 lg:space-y-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onAvatarFileSelected}
        />


        {/* Success Message */}
        {saved && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 lg:p-5 flex items-center gap-2.5 sm:gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shrink-0">
              <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 sm:w-5 sm:h-5" />
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm lg:text-base">
              تم حفظ التغييرات بنجاح!
            </p>
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 dark:border-[#2A2A2A] overflow-hidden bg-white dark:bg-[#111111]">
          <div className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 lg:pt-12 pb-5 sm:pb-6 lg:pb-8">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4 sm:mb-5">
                <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full overflow-hidden border-4 border-white dark:border-[#111111] shadow-lg bg-white dark:bg-[#1A1A1A]">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayUser.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Avatar
                      name={displayUser.name}
                      src={avatarUrl || displayUser.avatar_url}
                      size="xl"
                      className="w-full h-full rounded-full"
                    />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="
                    absolute
                    -bottom-1
                    -left-1
                    w-8
                    h-8
                    sm:w-10
                    sm:h-10
                    bg-white
                    dark:bg-[#1A1A1A]
                    border
                    border-gray-200
                    dark:border-[#2A2A2A]
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-lg
                    hover:shadow-xl
                    hover:scale-105
                    transition-all
                    duration-300
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {uploadingAvatar ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={16} className="text-[#B348FE] sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              </div>

              {editing ? (
                <div className="mb-2 w-full flex justify-center px-2">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="bg-gray-50 dark:bg-[#1A1A1A] border-2 border-gray-200 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 text-gray-900 dark:text-white text-lg sm:text-xl lg:text-2xl font-black focus:outline-none focus:ring-2 focus:ring-[#B348FE]/50 w-full sm:w-auto text-center"
                  />
                </div>
              ) : (
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white mb-1.5 sm:mb-2 px-2 break-words">
                  {editName}
                </h1>
              )}
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm lg:text-base font-medium px-2">
                مرحبا بك في منصة مستر زياد ربيع
              </p>
            </div>
          </div>
        </div>

        {cropFile && (
          <ImageCropModal
            file={cropFile}
            aspect={1}
            shape="circle"
            onCancel={handleCropCancel}
            onCropped={handleCropped}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {/* Left: Stats + Info */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            {/* Personal Info */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-4 sm:mb-6">
                  البيانات الشخصية
                </h2>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                  {[
                    { label: "الاسم بالكامل", value: editName },
                    { label: "رقم الهاتف", value: displayUser.phone || "01012345678" },
                    { label: "هاتف ولي الأمر", value: "01098765432" },
                    { label: "الصف الدراسي", value: displayUser.gradeLabel || "الصف الثالث الثانوي" },
                    { label: "المحافظة", value: displayUser.governorate || "القاهرة" },
                  ].map((field, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-3.5 sm:p-4 lg:p-5 hover:border-[#B348FE] transition-all duration-300 min-w-0"
                    >
                      <p className="text-[11px] sm:text-xs lg:text-sm text-gray-400 dark:text-gray-500 mb-1 sm:mb-1.5 font-bold">
                        {field.label}
                      </p>
                      <p className="font-black text-gray-900 dark:text-white text-xs sm:text-sm lg:text-base break-words">
                        {field.value}
                      </p>
                    </div>
                  ))}
               </div>
              </CardContent>
            </Card>

            {/* Subscription Invoices */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center shrink-0">
                    <Receipt size={18} className="text-[#B348FE] sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                      سجل الاشتراكات والفواتير
                    </h2>
                    <p className="text-[11px] sm:text-xs lg:text-sm text-gray-400 dark:text-gray-500">
                      تاريخ اشتراكاتك ومدفوعاتك
                    </p>
                  </div>
                </div>

                {loadingPayments ? (
                  <div className="py-10 text-center text-gray-400 text-xs sm:text-sm font-bold">
                    جاري التحميل...
                  </div>
                ) : subscriptionPayments.length === 0 ? (
                  <div className="py-10 text-center">
                    <Receipt className="mx-auto text-gray-300 dark:text-gray-700 mb-3" size={40} />
                    <p className="text-gray-500 dark:text-gray-400 font-bold text-xs sm:text-sm">
                      لا توجد اشتراكات مسجلة بعد
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {subscriptionPayments.map((p) => (
                      <div
                        key={p.id}
                        className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-[#B348FE] transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <p className="font-black text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {p.courseData?.title || "-"}
                            </p>
                            <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              فاتورة رقم {p.invoice_number}
                            </p>
                          </div>
                          {paymentStatusBadge(p.payment_status)}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          <div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-0.5">النوع</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {p.student_type === "online" ? "Online" : "Center"}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-0.5">المبلغ</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {p.amount} جنيه
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-0.5">البداية</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {new Date(p.subscription_start_date).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 font-bold mb-0.5">الانتهاء</p>
                            <p className="font-bold text-gray-800 dark:text-gray-200 text-xs sm:text-sm">
                              {new Date(p.subscription_end_date).toLocaleDateString("ar-EG")}
                            </p>
                          </div>
                        </div>

                        {p.subscription_code && p.payment_status === "verified" && (
                          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-[#2A2A2A] flex items-center justify-between">
                            <span className="text-[11px] sm:text-xs text-gray-400 font-bold">كود الاشتراك</span>
                            <span
                              className="font-black text-[#B348FE] text-xs sm:text-sm tracking-widest"
                              dir="ltr"
                            >
                              {p.subscription_code}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
              <CardContent className="p-4 sm:p-6 lg:p-8">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm((v) => !v)}
                  className="w-full flex items-center gap-2.5 sm:gap-3"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center shrink-0">
                    <Lock size={18} className="text-[#B348FE] sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1 text-right">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                      تغيير كلمة المرور
                    </h2>
                    <p className="text-[11px] sm:text-xs lg:text-sm text-gray-400 dark:text-gray-500">
                      اختر كلمة مرور جديدة لحسابك
                    </p>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 shrink-0 transition-transform duration-300 ${
                      showPasswordForm ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showPasswordForm && (
                  <div className="mt-5 sm:mt-6">
                    {passwordSuccess && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900 rounded-xl sm:rounded-2xl p-3.5 sm:p-4 mb-4 sm:mb-5 flex items-center gap-2.5 sm:gap-3">
                        <CheckCircle size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 sm:w-5 sm:h-5" />
                        <p className="text-emerald-700 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                          تم تغيير كلمة المرور بنجاح!
                        </p>
                      </div>
                    )}

                    <div className="space-y-3.5 sm:space-y-4">
                      {/* New Password */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#B348FE] transition-colors">
                          <Lock size={15} className="text-[#B348FE] flex-shrink-0 sm:w-4 sm:h-4" />
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="كلمة المرور الجديدة"
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              setPasswordError("");
                            }}
                            dir="ltr"
                            className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                          >
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>

                        {strength && (
                          <div className="mt-1.5">
                            <div className="h-1 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{ background: strength.color, width: strength.width }}
                              />
                            </div>
                            <p className="text-[10px] sm:text-[11px] text-gray-400 mt-1">
                              قوة كلمة المرور:{" "}
                              <span style={{ color: strength.color, fontWeight: 700 }}>
                                {strength.label}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div className="flex items-center gap-2.5 sm:gap-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-xl sm:rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 focus-within:border-[#B348FE] transition-colors">
                        <Lock size={15} className="text-[#B348FE] flex-shrink-0 sm:w-4 sm:h-4" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="تأكيد كلمة المرور"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setPasswordError("");
                          }}
                          dir="ltr"
                          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                        >
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>

                      {passwordError && (
                        <p className="text-[11px] sm:text-xs text-red-500 font-bold break-words">{passwordError}</p>
                      )}

                      <Button
                        onClick={handleChangePassword}
                        disabled={passwordLoading || !newPassword || !confirmPassword}
                        className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl sm:rounded-2xl h-11 sm:h-12 font-black disabled:opacity-60 text-sm"
                      >
                        {passwordLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 size={17} className="animate-spin" />
                            جاري الحفظ...
                          </span>
                        ) : (
                          "حفظ كلمة المرور الجديدة"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Achievements */}
          <div className="space-y-5 sm:space-y-6">
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl sm:rounded-3xl shadow-sm">
              <CardContent className="py-9 sm:py-12 lg:py-16 text-center px-4 sm:px-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-4 sm:mb-5">
                  <Award size={30} className="text-amber-500 sm:w-9 sm:h-9" />
                </div>

                <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-2.5 sm:mb-3">
                  الإنجازات
                </h3>

                <p className="text-gray-500 dark:text-gray-400 leading-6 sm:leading-7 lg:leading-8 mb-5 sm:mb-6 text-xs sm:text-sm lg:text-base">
                  سيتم إضافة نظام الإنجازات والشارات
                  قريبًا بعد إطلاق نظام النقاط.
                </p>

                <Badge variant="amber" className="inline-flex">
                  🚧 تحت التطوير
                </Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}
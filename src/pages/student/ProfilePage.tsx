import { useState, useRef, useEffect } from "react";
import { Camera, Edit2, CheckCircle, Star, Trophy, BookOpen, Award, Shield, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import StudentLayout from "./StudentLayout";
import { Card, CardContent } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { ProgressBar } from "../../components/ui/ProgressBar";
import { Avatar } from "../../components/ui/Avatar";
import { useApp } from "../../context/AppContext";
import { CURRENT_STUDENT, COURSES, LEADERBOARD } from "../../data/mockData";
import { supabase } from "../../lib/supabase";

function ImageCropModal({
  file,
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

  // اضبط عرض منطقة القص حسب حجم الشاشة (موبايل / تابلت / لابتوب)
  useEffect(() => {
    const computeWidth = () => {
      const screenW = window.innerWidth;
      const maxModalWidth = Math.min(screenW - 64, 420) - 40; // هوامش المودال
      const w = Math.max(220, Math.min(360, maxModalWidth));
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-[#111111] w-full max-w-[420px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[#2A2A2A]">
        <div className="p-5 border-b border-gray-100 dark:border-[#2A2A2A]">
          <h3 className="font-black text-gray-900 dark:text-white text-lg">اقصص الصورة</h3>
        </div>
        <div className="p-5 flex flex-col items-center gap-4">
          <div
            className={`relative overflow-hidden touch-none select-none bg-gray-100 dark:bg-[#1A1A1A] ${
              shape === "circle" ? "rounded-full" : "rounded-2xl"
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
            <div className="w-full flex items-center gap-3">
              <span className="text-xs text-gray-400 font-bold whitespace-nowrap">تصغير</span>
              <input
                type="range"
                min={minScale}
                max={minScale * 3}
                step={0.01}
                value={scale}
                onChange={(e) => zoom(e.target.value)}
                className="flex-1 accent-[#B348FE]"
              />
              <span className="text-xs text-gray-400 font-bold whitespace-nowrap">تكبير</span>
            </div>
          )}
        </div>
        <div className="p-5 border-t border-gray-100 dark:border-[#2A2A2A] flex gap-3">
          <Button onClick={confirm} className="flex-1 bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-xl h-12 font-black">
            حفظ
          </Button>
          <Button variant="outline" onClick={onCancel} className="flex-1 rounded-xl h-12 font-black">
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
  const [coverUrl, setCoverUrl] = useState(displayUser.cover_url || "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<"avatar" | "cover" | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

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
    setCropTarget("avatar");
    setCropFile(file);
  };

  const onCoverFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !validateImageFile(file)) return;
    setCropTarget("cover");
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

  const uploadCoverBlob = async (blob: Blob) => {
    try {
      setUploadingCover(true);

      if (!user?.id) {
        alert("يجب تسجيل الدخول أولاً");
        return;
      }

      const filePath = `${user.id}/cover.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { upsert: true, contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const cover = `${data.publicUrl}?t=${Date.now()}`;

      const { error } = await supabase
        .from("students")
        .update({ cover_url: cover })
        .eq("auth_id", user.id);

      if (error) throw error;

      setCoverUrl(cover);
      updateUser({ cover_url: cover });

      alert("تم تحديث صورة الغلاف بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفع صورة الغلاف");
    } finally {
      setUploadingCover(false);
      if (coverFileInputRef.current) coverFileInputRef.current.value = "";
    }
  };

  const handleCropped = (blob: Blob) => {
    if (cropTarget === "avatar") uploadAvatarBlob(blob);
    if (cropTarget === "cover") uploadCoverBlob(blob);
    setCropFile(null);
    setCropTarget(null);
  };

  const handleCropCancel = () => {
    setCropFile(null);
    setCropTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

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
      <div className="max-w-5xl mx-auto p-6 lg:p-8 space-y-6 lg:space-y-8">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onAvatarFileSelected}
        />
        <input
          ref={coverFileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onCoverFileSelected}
        />

        {/* Success Message */}
        {saved && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 lg:p-5 flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm lg:text-base">
              تم حفظ التغييرات بنجاح!
            </p>
          </div>
        )}

        {/* Profile Header */}
        <div className="rounded-3xl overflow-hidden shadow-xl">
          {/* Cover Photo */}
          <div className="relative w-full h-28 sm:h-40 lg:h-52 bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] overflow-hidden">
            {coverUrl && (
              <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-black/10" />
            <button
              onClick={() => coverFileInputRef.current?.click()}
              disabled={uploadingCover}
              className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 bg-white/90 hover:bg-white text-[#B348FE] rounded-xl sm:rounded-2xl px-2.5 py-1.5 sm:px-4 sm:py-2.5 flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-bold shadow-lg transition-all disabled:opacity-60"
            >
              {uploadingCover ? (
                <div className="w-4 h-4 border-2 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={14} className="sm:w-[16px] sm:h-[16px]" />
              )}
              <span className="hidden xs:inline sm:inline">تغيير الغلاف</span>
            </button>
          </div>

          {/* Info panel */}
          <div className="bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] px-6 lg:px-8 pt-0 pb-6 lg:pb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

<div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 lg:gap-8">
  {/* Avatar */}
  <div className="relative flex-shrink-0 -mt-12 sm:-mt-14 lg:-mt-16 z-10">
    <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-white">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayUser.name}
          className="w-full h-full object-cover rounded-3xl"
        />
      ) : (
        <Avatar
          name={displayUser.name}
          src={avatarUrl || displayUser.avatar_url}
          size="xl"
          className="w-full h-full rounded-3xl"
        />
      )}
    </div>
    <button
      onClick={() => fileInputRef.current?.click()}
      disabled={uploadingAvatar}
      className="
        absolute
        -bottom-2
        -left-2
        w-9
        h-9
        sm:w-10
        sm:h-10
        bg-white
        rounded-2xl
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
        <div className="w-5 h-5 border-2 border-[#B348FE] border-t-transparent rounded-full animate-spin" />
      ) : (
        <Camera size={18} className="text-[#B348FE]" />
      )}
    </button>
  </div>

  {/* Info */}
  <div className="flex-1 flex flex-col justify-center text-center sm:text-right pb-1 sm:pb-2">
    {editing ? (
      <div className="mb-2">
        <input
          value={editName}
          onChange={e => setEditName(e.target.value)}
          className="bg-white/10 border-2 border-white/30 rounded-2xl px-4 lg:px-5 py-2.5 lg:py-3 text-white text-xl lg:text-2xl font-black focus:outline-none focus:ring-2 focus:ring-white/50 w-full sm:w-auto backdrop-blur-sm"
        />
      </div>
    ) : (
      <h1 className="text-2xl lg:text-3xl font-black text-white mb-2">
        {editName}
      </h1>
    )}
    <p className="text-white/80 text-sm lg:text-base font-medium">
      مرحبا بك في منصة مستر زياد ربيع
    </p>
  </div>
</div>
          </div>
        </div>

        {cropFile && (
          <ImageCropModal
            file={cropFile}
            aspect={cropTarget === "cover" ? 3 : 1}
            shape={cropTarget === "avatar" ? "circle" : "rect"}
            onCancel={handleCropCancel}
            onCropped={handleCropped}
          />
        )}

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Stats + Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-6">
                  البيانات الشخصية
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 lg:gap-5">
                  {[
                    { label: "الاسم بالكامل", value: editName },
                    { label: "رقم الهاتف", value: displayUser.phone || "01012345678" },
                    { label: "هاتف ولي الأمر", value: "01098765432" },
                    { label: "الصف الدراسي", value: displayUser.gradeLabel || "الصف الثالث الثانوي" },
                    { label: "المحافظة", value: displayUser.governorate || "القاهرة" },
                  ].map((field, i) => (
                    <div 
                      key={i} 
                      className="bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl p-4 lg:p-5 hover:border-[#B348FE] transition-all duration-300"
                    >
                      <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500 mb-1.5 font-bold">
                        {field.label}
                      </p>
                      <p className="font-black text-gray-900 dark:text-white text-sm lg:text-base">
                        {field.value}
                      </p>
                    </div>
                  ))}

               </div>
              </CardContent>
            </Card>

            {/* Change Password */}
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-11 h-11 rounded-2xl bg-[#F6EEFF] dark:bg-[#2B103D] flex items-center justify-center">
                    <Lock size={20} className="text-[#B348FE]" />
                  </div>
                  <div>
                    <h2 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">
                      تغيير كلمة المرور
                    </h2>
                    <p className="text-xs lg:text-sm text-gray-400 dark:text-gray-500">
                      اختر كلمة مرور جديدة لحسابك
                    </p>
                  </div>
                </div>

                {passwordSuccess && (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 mb-5 flex items-center gap-3">
                    <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
                    <p className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      تم تغيير كلمة المرور بنجاح!
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  {/* New Password */}
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 focus-within:border-[#B348FE] transition-colors">
                      <Lock size={16} className="text-[#B348FE] flex-shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="كلمة المرور الجديدة"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordError("");
                        }}
                        dir="ltr"
                        className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                        <p className="text-[11px] text-gray-400 mt-1">
                          قوة كلمة المرور:{" "}
                          <span style={{ color: strength.color, fontWeight: 700 }}>
                            {strength.label}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-100 dark:border-[#2A2A2A] rounded-2xl px-4 py-3 focus-within:border-[#B348FE] transition-colors">
                    <Lock size={16} className="text-[#B348FE] flex-shrink-0" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="تأكيد كلمة المرور"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPasswordError("");
                      }}
                      dir="ltr"
                      className="flex-1 min-w-0 bg-transparent border-0 outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {passwordError && (
                    <p className="text-xs text-red-500 font-bold">{passwordError}</p>
                  )}

                  <Button
                    onClick={handleChangePassword}
                    disabled={passwordLoading || !newPassword || !confirmPassword}
                    className="w-full bg-[#B348FE] hover:bg-[#9E2FFF] text-white rounded-2xl h-12 font-black disabled:opacity-60"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" />
                        جاري الحفظ...
                      </span>
                    ) : (
                      "حفظ كلمة المرور الجديدة"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Achievements */}
          <div className="space-y-6">
            <Card className="bg-white dark:bg-[#111111] border border-gray-100 dark:border-[#2A2A2A] rounded-3xl shadow-sm">
              <CardContent className="py-12 lg:py-16 text-center px-6">
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center mx-auto mb-5">
                  <Award
                    size={36}
                    className="text-amber-500"
                  />
                </div>

                <h3 className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white mb-3">
                  الإنجازات
                </h3>

                <p className="text-gray-500 dark:text-gray-400 leading-7 lg:leading-8 mb-6 text-sm lg:text-base">
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
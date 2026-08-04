import { useState, useRef } from "react";
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
    phone: CURRENT_STUDENT.phone 
  };

  const [avatarUrl, setAvatarUrl] = useState(
  displayUser.avatar_url || ""
);

const [uploadingAvatar, setUploadingAvatar] = useState(false);
const handleAvatarUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    alert("يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    alert("حجم الصورة يجب ألا يتجاوز 5MB");
    return;
  }

  try {
    setUploadingAvatar(true);

    if (!user?.id) {
  alert("يجب تسجيل الدخول أولاً");
  return;
}
    const extension = file.type.split("/")[1];

    const filePath = `${user?.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatar = `${data.publicUrl}?t=${Date.now()}`;

    const { error } = await supabase
      .from("students")
      .update({
        avatar_url: avatar,
      })
      .eq("auth_id", user?.id);

    if (error) throw error;

    setAvatarUrl(avatar);
updateUser({
  avatar_url: avatar,
});

    alert("تم تحديث الصورة بنجاح");
    if (fileInputRef.current) {
  fileInputRef.current.value = "";
}
  } catch (err) {
    console.error(err);
    alert("حدث خطأ أثناء رفع الصورة");
  } finally {
    setUploadingAvatar(false);
  }
};

const fileInputRef = useRef<HTMLInputElement>(null);

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
  onChange={handleAvatarUpload}
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
          <div className="bg-gradient-to-br from-[#B348FE] to-[#9E2FFF] rounded-3xl p-6 lg:p-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3"></div>

            <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-6 lg:gap-8 min-h-[150px]">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 lg:w-28 lg:h-28 rounded-3xl overflow-hidden border-4 border-white/20 shadow-lg">
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
    w-10
    h-10
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
              <div className="flex-1 flex flex-col justify-center text-center sm:text-right">
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
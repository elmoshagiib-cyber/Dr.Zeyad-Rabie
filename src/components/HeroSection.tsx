import React from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, TrendingUp, Star, Zap, Award } from 'lucide-react';

const TEACHER_IMAGE = "https://images.pexels.com/photos/5212339/pexels-photo-5212339.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800";

const stats = [
  { icon: Users, value: '+50K', label: 'طالب', gradient: 'from-violet-500 to-purple-700' },
  { icon: BookOpen, value: '+120', label: 'كورس', gradient: 'from-purple-500 to-fuchsia-700' },
  { icon: TrendingUp, value: '98%', label: 'نسبة النجاح', gradient: 'from-fuchsia-500 to-purple-700' },
];

// Floating decorative particles
const particles = [
  { top: '8%', left: '12%', size: 'w-2 h-2', delay: 0 },
  { top: '15%', left: '85%', size: 'w-3 h-3', delay: 0.8 },
  { top: '35%', left: '5%', size: 'w-2 h-2', delay: 1.6 },
  { top: '55%', left: '90%', size: 'w-2 h-2', delay: 0.4 },
  { top: '75%', left: '8%', size: 'w-3 h-3', delay: 1.2 },
  { top: '85%', left: '80%', size: 'w-2 h-2', delay: 2 },
];

const HeroSection: React.FC = () => {
  return (
    <div className="relative flex flex-col h-full min-h-full overflow-hidden hero-gradient select-none">

      {/* ── Background layer ───────────────────────────────────── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {/* Large glowing orbs */}
        <motion.div
          className="absolute -top-24 -right-24 w-72 h-72 lg:w-[420px] lg:h-[420px] orb orb-1"
          animate={{ scale: [1, 1.18, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-24 -left-24 w-80 h-80 lg:w-[480px] lg:h-[480px] orb orb-2"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 orb orb-3"
          animate={{ scale: [1, 1.3, 1], opacity: [0.08, 0.18, 0.08] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(167,139,250,0.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(167,139,250,0.8) 1px, transparent 1px)
            `,
            backgroundSize: '56px 56px',
          }}
        />

        {/* Diagonal accent line */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(45deg, rgba(139,92,246,0.6) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-[12%] left-[8%] w-14 h-14 rounded-2xl border-2 border-purple-400/25"
          animate={{ rotate: [0, 45, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[22%] right-[6%] w-10 h-10 rounded-xl border border-violet-300/30 bg-violet-600/10"
          animate={{ rotate: [0, -30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
        <motion.div
          className="absolute top-[48%] right-[4%] w-8 h-8 rounded-lg bg-purple-500/15"
          animate={{ rotate: [0, 90, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        />
        <motion.div
          className="absolute top-[70%] left-[12%] w-6 h-6 rounded-full border-2 border-purple-300/30"
          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        />

        {/* Floating particles */}
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className={`absolute ${p.size} rounded-full bg-purple-300/50`}
            style={{ top: p.top, left: p.left }}
            animate={{ y: [-6, 6, -6], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
          />
        ))}
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col h-full p-5 sm:p-7 lg:p-9">

        {/* Top Badge */}
        <motion.div
          className="flex justify-center mb-5 mt-1"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
            <Star className="w-4 h-4 text-yellow-400" fill="#facc15" />
            <span className="text-white/90 text-xs sm:text-sm font-bold">المنصة التعليمية الأولى في المنطقة</span>
            <Award className="w-4 h-4 text-purple-300" />
          </div>
        </motion.div>

        {/* Teacher Image + Rings */}
        <motion.div
          className="relative flex-1 flex items-center justify-center mb-5"
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.35, duration: 0.85, ease: [0.175, 0.885, 0.32, 1.275] }}
        >
          {/* Outer pulsing glow */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: 320, height: 320,
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, transparent 70%)',
              filter: 'blur(25px)',
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.75, 0.4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Rotating dashed ring */}
          <motion.div
            className="absolute rounded-full border-2 border-dashed border-purple-400/22"
            style={{ width: 310, height: 310 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
          />

          {/* Solid thin ring */}
          <motion.div
            className="absolute rounded-full border border-violet-300/18"
            style={{ width: 268, height: 268 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          {/* Ring dots */}
          {[0, 72, 144, 216, 288].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const r = 134;
            return (
              <motion.div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-purple-400/65"
                style={{
                  boxShadow: '0 0 8px rgba(139, 92, 246, 0.7)',
                  top: `calc(50% + ${Math.sin(rad) * r}px - 5px)`,
                  left: `calc(50% + ${Math.cos(rad) * r}px - 5px)`,
                }}
                animate={{ scale: [1, 1.7, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.44 }}
              />
            );
          })}

          {/* Teacher image card */}
          <motion.div
            className="relative z-10 rounded-[28px] overflow-hidden"
            style={{
              width: 225,
              height: 290,
              boxShadow: '0 30px 70px rgba(109, 40, 217, 0.55), 0 0 0 1px rgba(139,92,246,0.3)',
            }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={TEACHER_IMAGE}
              alt="معلم محترف"
              className="w-full h-full object-cover object-top"
              loading="eager"
            />
            {/* Bottom overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#22063D]/80 via-[#22063D]/20 to-transparent" />

            {/* Floating badge inside */}
            <motion.div
              className="absolute bottom-3 right-3 left-3 bg-white/12 backdrop-blur-lg rounded-2xl p-2.5 border border-white/20"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center flex-shrink-0 shadow-md">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <p className="text-white text-[11px] font-bold leading-tight">متاح الآن للتعلم</p>
                  <p className="text-white/65 text-[10px]">+120 درس تفاعلي</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Floating achievement badge */}
          <motion.div
            className="absolute top-[10%] left-[5%] sm:left-[8%] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            style={{ boxShadow: '0 8px 32px rgba(109,40,217,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <div className="text-lg">🏆</div>
              <div>
                <p className="text-white text-[11px] font-black">أفضل منصة</p>
                <p className="text-white/60 text-[9px]">2026</p>
              </div>
            </div>
          </motion.div>

          {/* Floating score badge */}
          <motion.div
            className="absolute bottom-[15%] left-[2%] sm:left-[5%] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7, duration: 0.6 }}
            style={{ boxShadow: '0 8px 32px rgba(109,40,217,0.25)' }}
          >
            <div className="flex items-center gap-2">
              <div className="text-lg">📈</div>
              <div>
                <p className="text-white text-[11px] font-black">تحسن النتائج</p>
                <p className="text-white/60 text-[9px]">لكل طالب</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Headlines */}
        <motion.div
          className="text-center mb-3"
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.7 }}
        >
          <h1 className="text-3xl lg:text-4xl xl:text-[2.75rem] font-black text-white leading-tight tracking-tight mb-1">
            تعلم بذكاء
          </h1>
          <h2 className="text-2xl lg:text-3xl xl:text-4xl font-black gradient-text-white leading-tight tracking-tight">
            حقق أعلى الدرجات
          </h2>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-center text-white/65 text-sm lg:text-[15px] leading-relaxed mb-6 max-w-xs mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
        >
          منصة تعليمية متكاملة لمتابعة الدروس والواجبات والاختبارات وتحليل مستوى الطالب خطوة بخطوة
        </motion.p>

        {/* Stat Cards */}
        <motion.div
          className="grid grid-cols-3 gap-2.5 sm:gap-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="stat-card rounded-2xl p-3 text-center cursor-default"
              whileHover={{ scale: 1.06, y: -4 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-2`}
                style={{ boxShadow: '0 4px 12px rgba(109,40,217,0.4)' }}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              <p className="text-white font-black text-xl leading-none">{stat.value}</p>
              <p className="text-white/60 text-[11px] mt-1 font-semibold">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;

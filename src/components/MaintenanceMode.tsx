import { Wrench, Sparkles, Hammer, HardHat, Paintbrush, Cog } from "lucide-react";
import { motion } from "framer-motion";

export function MaintenanceMode() {
  return (
    <div
      dir="rtl"
      className="
        fixed inset-0 z-[99999]
        flex items-center justify-center
        bg-gradient-to-br from-[#0f0721] via-[#1a0b2e] to-[#2d1155]
        overflow-hidden
        px-6
      "
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
      </div>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="absolute top-1/4 -right-32 w-[500px] h-[500px] bg-[#B348FE]/20 rounded-full blur-[150px]"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="absolute bottom-1/4 -left-32 w-[500px] h-[500px] bg-[#F6AC08]/15 rounded-full blur-[150px]"
      />
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#7C1FE0]/10 rounded-full blur-[120px]"
      />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
          className="relative mb-12"
        >
          <motion.div
            animate={{
              rotate: [0, 5, -5, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              w-32 h-32 sm:w-36 sm:h-36
              mx-auto
              rounded-[32px]
              bg-gradient-to-br from-[#B348FE] via-[#9333EA] to-[#7C1FE0]
              flex items-center justify-center
              shadow-[0_25px_80px_rgba(179,72,254,.6)]
              border-4 border-white/10
              relative
            "
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Wrench className="text-white w-16 h-16 sm:w-20 sm:h-20" strokeWidth={2.5} />
            </motion.div>

            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -top-6 -right-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F6AC08] to-[#F59E0B] flex items-center justify-center shadow-[0_15px_40px_rgba(246,172,8,.5)]"
            >
              <Cog className="text-white w-8 h-8" />
            </motion.div>

            <motion.div
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute -bottom-4 -left-4 w-14 h-14 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-[0_15px_40px_rgba(16,185,129,.5)]"
            >
              <Hammer className="text-white w-7 h-7" />
            </motion.div>

            <motion.div
              animate={{
                y: [-10, 10, -10],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-8 left-1/2 -translate-x-1/2"
            >
              <HardHat className="text-[#F6AC08] w-10 h-10 drop-shadow-[0_5px_15px_rgba(246,172,8,.8)]" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2"
          >
            <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-[#B348FE] to-[#F6AC08] shadow-[0_10px_40px_rgba(179,72,254,.4)]">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="text-white w-5 h-5" />
              </motion.div>
              <span className="text-white font-black text-sm tracking-wider">جاري التطوير</span>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="text-white w-5 h-5" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="space-y-6 mb-10"
        >
          <h1 className="text-white text-[32px] sm:text-[48px] md:text-[56px] font-black leading-tight">
            المنصة بتتحدث دلوقتي
            <br />
            <span className="bg-gradient-to-r from-[#B348FE] via-[#F6AC08] to-[#B348FE] bg-clip-text text-transparent">
              عشان تبقى أحسن ليك
            </span>
          </h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="h-1 w-32 mx-auto rounded-full bg-gradient-to-r from-transparent via-[#B348FE] to-transparent"
          />

          <p className="text-slate-300 text-[16px] sm:text-[19px] leading-relaxed max-w-xl mx-auto font-medium">
            إحنا شغالين على تحسينات جديدة هتفيدك في رحلتك الدراسية.
            <br />
            <span className="text-[#F6AC08] font-bold">هنرجع تاني قريبًا جدًا، استنونا شوية 🚀</span>
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-8"
        >
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {[
              { icon: Paintbrush, label: "تصميم جديد", color: "from-pink-500 to-rose-500" },
              { icon: Cog, label: "تحسينات تقنية", color: "from-blue-500 to-cyan-500" },
              { icon: Sparkles, label: "ميزات جديدة", color: "from-purple-500 to-indigo-500" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1 + index * 0.1, type: "spring", stiffness: 200 }}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-2xl
                  bg-gradient-to-r ${item.color}
                  shadow-[0_10px_30px_rgba(0,0,0,.3)]
                  border border-white/20
                  backdrop-blur-sm
                `}
              >
                <item.icon className="text-white w-5 h-5" />
                <span className="text-white font-bold text-sm">{item.label}</span>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                }}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-[#B348FE] to-[#F6AC08]"
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="
              inline-block
              px-8 py-4
              rounded-2xl
              bg-white/5
              backdrop-blur-md
              border border-white/10
              shadow-[0_15px_50px_rgba(0,0,0,.3)]
            "
          >
            <p className="text-slate-400 text-sm font-medium">
              نقدر وقتك و{" "}
              <span className="text-[#B348FE] font-bold">هنرجعلك بتجربة أفضل</span>
            </p>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-1 h-12 rounded-full bg-gradient-to-b from-transparent via-[#B348FE] to-transparent" />
          <div className="w-2 h-2 rounded-full bg-[#B348FE] shadow-[0_0_20px_rgba(179,72,254,.8)]" />
        </div>
      </motion.div>

      <div className="absolute top-10 left-10 opacity-30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="text-[#B348FE] w-12 h-12" />
        </motion.div>
      </div>
      <div className="absolute bottom-10 right-10 opacity-30">
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="text-[#F6AC08] w-16 h-16" />
        </motion.div>
      </div>
      <div className="absolute top-1/3 right-20 opacity-20">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Cog className="text-white w-8 h-8" />
        </motion.div>
      </div>
    </div>
  );
}
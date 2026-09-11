import {
  createContext,
  useCallback,
  useContext,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

type TransitionState = {
  path: string;
  phase: "covering" | "holding";
} | null;

type TransitionFn = (path: string) => void;

const PageTransitionContext = createContext<TransitionFn>(() => {});

/**
 * استخدمها جوا أي كومبوننت عايز يعمل navigate مع تأثير الفقاعة
 * (بدل ما تستخدم useNavigate + navigate(path) مباشرة).
 *
 * مثال:
 *   const transitionTo = usePageTransition();
 *   transitionTo("/dashboard/courses");
 */
export function usePageTransition() {
  return useContext(PageTransitionContext);
}

function Bubbles({
  transition,
  onAnimationEnd,
}: {
  transition: TransitionState;
  onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={
        transition ? `page-bubbles ${transition.phase}` : "page-bubbles"
      }
    >
      <div className="page-bubbles__first" />
      <div className="page-bubbles__second" onAnimationEnd={onAnimationEnd} />
    </div>
  );
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [transition, setTransition] = useState<TransitionState>(null);

  const transitionTo = useCallback<TransitionFn>((path) => {
    setTransition((current) =>
      // لو فيه انتقال شغال بالفعل، متعملش دبل-تريجر
      current ?? {
        path,
        phase: "covering",
      }
    );
  }, []);

  const handleAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (!transition) return;

    // الفقاعة التانية خلصت تغطي الشاشة بالكامل -> دلوقتي نعمل navigate فعليًا
    if (event.animationName === "page-bubble-second-move") {
      navigate(transition.path);
      setTransition((current) =>
        current ? { ...current, phase: "holding" } : current
      );
    }

    // خلصنا فترة "الإمساك" -> نشيل الأوفرلاي ونكشف الصفحة الجديدة
    if (event.animationName === "page-bubble-hold") {
      setTransition(null);
    }
  };

  return (
    <PageTransitionContext.Provider value={transitionTo}>
      {children}
      <Bubbles transition={transition} onAnimationEnd={handleAnimationEnd} />
    </PageTransitionContext.Provider>
  );
}
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type AnimationEvent,
  type ReactNode,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

type TransitionState = {
  path: string;
  phase: "covering" | "holding" | "leaving";
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
  isInstructor,
}: {
  transition: TransitionState;
  onAnimationEnd: (event: AnimationEvent<HTMLDivElement>) => void;
  isInstructor: boolean;
}) {
  return (
    <div
      className={
        (transition ? `page-bubbles ${transition.phase}` : "page-bubbles") +
        (isInstructor ? " theme-instructor" : "")
      }
    >
      <div className="page-bubbles__first" />
      <div className="page-bubbles__second" onAnimationEnd={onAnimationEnd} />
    </div>
  );
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [transition, setTransition] = useState<TransitionState>(null);

  // بنحدد لون الفقاعة على أساس الصفحة اللي رايحينلها أثناء الانتقال،
  // أو الصفحة الحالية لو مفيش انتقال شغال
  const isInstructor = (transition?.path ?? location.pathname).startsWith(
    "/instructor"
  );

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

    // خلصنا فترة "الإمساك" -> نخلي الفقاعة تكمل طلوعها لفوق وتخرج برّه الشاشة
    if (event.animationName === "page-bubble-hold") {
      setTransition((current) =>
        current ? { ...current, phase: "leaving" } : current
      );
    }

    // الفقاعة خرجت خالص برّه الشاشة -> نشيل الأوفرلاي (مش هيبان لأنه أصلاً مختفي)
    if (event.animationName === "page-bubble-leave") {
      setTransition(null);
    }
  };

  return (
    <PageTransitionContext.Provider value={transitionTo}>
      {children}
      <Bubbles
        transition={transition}
        onAnimationEnd={handleAnimationEnd}
        isInstructor={isInstructor}
      />
    </PageTransitionContext.Provider>
  );
}
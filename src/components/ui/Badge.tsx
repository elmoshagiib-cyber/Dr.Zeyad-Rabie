import { cn } from "../../utils/cn";

type BadgeVariant = "blue" | "emerald" | "violet" | "rose" | "amber" | "slate" | "red" | "green" | "purple";

const variants: Record<BadgeVariant, string> = {
  blue:
"bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",

emerald:
"bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",

violet:
"bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",

rose:
"bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",

amber:
"bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",

slate:
"bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({ children, variant = "blue", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border", variants[variant], className)}>
      {children}
    </span>
  );
}

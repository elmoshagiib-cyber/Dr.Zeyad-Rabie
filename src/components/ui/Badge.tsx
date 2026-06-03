import { cn } from "../../utils/cn";

type BadgeVariant = "blue" | "emerald" | "violet" | "rose" | "amber" | "slate" | "red" | "green";

const variants: Record<BadgeVariant, string> = {
  blue: "bg-blue-100 text-blue-700 border-blue-200",
  emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
  violet: "bg-violet-100 text-violet-700 border-violet-200",
  rose: "bg-rose-100 text-rose-700 border-rose-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  slate: "bg-slate-100 text-slate-600 border-slate-200",
  red: "bg-red-100 text-red-700 border-red-200",
  green: "bg-green-100 text-green-700 border-green-200",
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

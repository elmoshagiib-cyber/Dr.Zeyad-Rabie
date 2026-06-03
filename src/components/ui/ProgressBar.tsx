import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "h-1.5", md: "h-2.5", lg: "h-4" };

export function ProgressBar({ value, max = 100, className, barClassName, showLabel, size = "md" }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full rounded-full bg-slate-100 overflow-hidden", sizes[size])}>
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700", barClassName)}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-500 mt-1 block">{percent.toFixed(0)}%</span>
      )}
    </div>
  );
}

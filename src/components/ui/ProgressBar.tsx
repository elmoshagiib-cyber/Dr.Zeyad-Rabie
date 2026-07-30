import { cn } from "../../utils/cn";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

export function ProgressBar({
  value,
  max = 100,
  className,
  barClassName,
  showLabel,
  size = "md",
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          `
          w-full
          overflow-hidden
          rounded-full
          bg-gray-200
          dark:bg-[#2A2A2A]
          `,
          sizes[size]
        )}
      >
        <div
          className={cn(
            `
            h-full
            rounded-full
            bg-gradient-to-r
            from-[#B348FE]
            to-[#9E2FFF]
            transition-all
            duration-700
            ease-out
            shadow-[0_0_12px_rgba(179,72,254,.25)]
            `,
            barClassName
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      {showLabel && (
        <span
          className="
            mt-2
            block
            text-xs
            font-medium
            text-gray-500
            dark:text-gray-400
          "
        >
          {percent.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
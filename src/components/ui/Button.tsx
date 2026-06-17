import { cn } from "../../utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";

type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-purple-700 to-violet-600 hover:from-purple-800 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25 active:scale-[0.98]",

  secondary:
"bg-slate-900 hover:bg-slate-800 text-white shadow-lg dark:shadow-purple-900/20",

  outline:
    "border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 dark:text-purple-300 bg-transparent",

  ghost:
    "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white dark:bg-[#130726]/5 bg-transparent",

  danger:
    "bg-red-600 hover:bg-red-700 text-white shadow-lg dark:shadow-red-900/20",

  success:
    "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg dark:shadow-emerald-900/20",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
  xl: "px-9 py-4.5 text-lg gap-3",
};

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
import { cn } from "../../utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98]",
  secondary: "bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200",
  outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent",
  ghost: "text-slate-600 hover:bg-slate-100 bg-transparent",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100",
  success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
  xl: "px-9 py-4.5 text-lg gap-3",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ variant = "primary", size = "md", children, fullWidth, className, ...props }: ButtonProps) {
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

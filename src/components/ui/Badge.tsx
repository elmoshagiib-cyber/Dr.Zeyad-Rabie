import { cn } from "../../utils/cn";

type BadgeVariant =
  | "blue"
  | "emerald"
  | "violet"
  | "rose"
  | "amber"
  | "slate"
  | "red"
  | "green"
  | "purple";

const variants: Record<BadgeVariant, string> = {
  blue: `
    bg-[#F6EEFF]
    text-[#B348FE]
    border-[#EAD8FF]
    dark:bg-[#2B103D]
    dark:text-[#D9A9FF]
    dark:border-[#4B1F67]
  `,

  purple: `
    bg-[#F6EEFF]
    text-[#B348FE]
    border-[#EAD8FF]
    dark:bg-[#2B103D]
    dark:text-[#D9A9FF]
    dark:border-[#4B1F67]
  `,

  violet: `
    bg-[#F6EEFF]
    text-[#B348FE]
    border-[#EAD8FF]
    dark:bg-[#2B103D]
    dark:text-[#D9A9FF]
    dark:border-[#4B1F67]
  `,

  emerald: `
    bg-emerald-100
    text-emerald-700
    border-emerald-200
    dark:bg-emerald-900/20
    dark:text-emerald-300
    dark:border-emerald-800
  `,

  green: `
    bg-emerald-100
    text-emerald-700
    border-emerald-200
    dark:bg-emerald-900/20
    dark:text-emerald-300
    dark:border-emerald-800
  `,

  amber: `
    bg-amber-100
    text-amber-700
    border-amber-200
    dark:bg-amber-900/20
    dark:text-amber-300
    dark:border-amber-800
  `,

  rose: `
    bg-rose-100
    text-rose-700
    border-rose-200
    dark:bg-rose-900/20
    dark:text-rose-300
    dark:border-rose-800
  `,

  red: `
    bg-red-100
    text-red-700
    border-red-200
    dark:bg-red-900/20
    dark:text-red-300
    dark:border-red-800
  `,

  slate: `
    bg-gray-100
    text-gray-700
    border-gray-200
    dark:bg-[#1F1F1F]
    dark:text-gray-300
    dark:border-[#2A2A2A]
  `,
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export function Badge({
  children,
  variant = "blue",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        `
        inline-flex
        items-center
        justify-center
        gap-1
        rounded-full
        border
        px-3
        py-1
        text-xs
        font-bold
        transition-all
        duration-300
        `,
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
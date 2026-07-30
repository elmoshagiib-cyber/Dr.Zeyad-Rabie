import { cn } from "../../utils/cn";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, glass, onClick }: CardProps) {
  return (
    <div
  onClick={onClick}
  className={cn(
    "rounded-[28px] border border-gray-200 bg-white dark:bg-[#111111] dark:border-[#2A2A2A] shadow-[0_8px_30px_rgba(15,23,42,.05)] transition-all duration-300",
   hover &&
  `
  cursor-pointer
  hover:-translate-y-1
  hover:border-[#B348FE]/30
  dark:hover:border-[#B348FE]/40
  hover:shadow-[0_18px_40px_rgba(179,72,254,.10)]
  dark:hover:shadow-[0_20px_45px_rgba(0,0,0,.65)]
  `,
glass &&
  "bg-white/90 dark:bg-[#111111]/90 backdrop-blur-xl",
    onClick && "cursor-pointer",
    className
  )}
>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-7 pb-0", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-7", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-7 pb-7 pt-0", className)}>{children}</div>;
}

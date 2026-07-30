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
    "rounded-[32px] border border-slate-200 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.05)] dark:bg-[#111111] dark:border-[#262626]",
    hover &&
      "cursor-pointer hover:-translate-y-0.5 transition-all duration-300 hover:shadow-[0_10px_35px_rgba(15,23,42,0.08)] dark:hover:shadow-[0_18px_45px_rgba(0,0,0,.55)]",
    glass &&
      "bg-white dark:bg-[#1b0d34]/80 backdrop-blur-sm",
    onClick && "cursor-pointer",
    className
  )}
>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-6 pb-6 pt-0", className)}>{children}</div>;
}

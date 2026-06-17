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
    "rounded-2xl border border-slate-200/80 bg-white dark:bg-[#1b0d34] dark:border-purple-500/20 dark:hover:border-purple-400/40",
    hover &&
      "cursor-pointer hover:-translate-y-1 transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_45px_rgba(168,85,247,0.25)]",
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

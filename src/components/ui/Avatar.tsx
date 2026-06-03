import { cn } from "../../utils/cn";

interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

function getInitials(name?: string) {
  if (!name) return "؟";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return parts[0][0] + parts[1][0];
  return parts[0][0] || "؟";
}

function getColor(name?: string) {
  const colors = [
    "bg-blue-500", "bg-violet-500", "bg-emerald-500", "bg-rose-500",
    "bg-amber-500", "bg-cyan-500", "bg-indigo-500", "bg-pink-500",
  ];
  if (!name) return colors[0];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn("rounded-full object-cover flex-shrink-0", sizes[size], className)}
      />
    );
  }
  return (
    <div className={cn("rounded-full flex items-center justify-center font-bold text-white flex-shrink-0", sizes[size], getColor(name), className)}>
      {getInitials(name)}
    </div>
  );
}

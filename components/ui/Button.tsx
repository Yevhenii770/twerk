import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold" | "underline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  className,
  children,
  variant = "secondary",
  size = "md",
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "cursor-pointer font-medium tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none uppercase text-xs";

  const variants = {
    primary: "bg-[#E8637A] text-white hover:bg-[#C94060] active:bg-[#a8334e]",
    secondary: "bg-[#1A1A1A] text-[#F5EDE0] border border-[#333] hover:border-[#C9A96E] hover:text-[#C9A96E]",
    outline: "border border-[#C9A96E] text-[#C9A96E] bg-transparent hover:bg-[#C9A96E] hover:text-[#0D0D0D]",
    gold: "bg-[#C9A96E] text-[#0D0D0D] hover:bg-[#E2C78A]",
    ghost: "bg-transparent text-[#F5EDE0] hover:text-[#C9A96E]",
    danger: "bg-red-600 text-white hover:bg-red-700",
    underline: "hover:underline p-6 text-[#F5EDE0]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-7 py-3.5 text-xs",
    lg: "px-10 py-4 text-sm",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], isLoading && "opacity-70 cursor-not-allowed", className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

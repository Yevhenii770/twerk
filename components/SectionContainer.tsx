import React from "react";
import { cn } from "@/lib/utils";

type SectionContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function SectionContainer({
  children,
  className,
}: SectionContainerProps) {
  return (
    <section
      className={cn(
        "flex flex-col md:flex-row w-full border-t border-gray-600",
        className
      )}
    >
      {children}
    </section>
  );
}

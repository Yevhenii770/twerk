import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Next lesson date calculation
export function getNextFridayFormatted(): string {
  const today = new Date();
  const day = today.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  today.setDate(today.getDate() + diff);

  return today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });
}

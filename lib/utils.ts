import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function mockDelay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

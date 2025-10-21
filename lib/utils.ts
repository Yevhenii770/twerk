import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


// Next lesson date calculation
export function getNextFridayFormatted(): string {
  
  const today = new Date();
  const day = today.getDay();

  // when friday
  let diff = (5 - day + 7) % 7
  // if day is friday, return today
  if (diff === 0) diff = 7;
// if day is after friday, return next friday
  const nextFriday = new Date(today);
  // date of next friday
  nextFriday.setDate(today.getDate() + diff);


  return nextFriday.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
  });
}

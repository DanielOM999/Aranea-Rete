// Imports ClassValue and clsx, this to add the funtionalit to apply classes based on conditions.
import { type ClassValue, clsx } from "clsx";

// Imports twMerge from tailwind-merge, this to merge conflicting classes when multiple classes are used.
import { twMerge } from "tailwind-merge";

// Exports the cn function which takes in a list of class values and merges them into a single string using tailwind-merge and clsx.
// This to allowe for easy conditional styling based on multiple classes.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num);
}

export const API_URL = import.meta.env.VITE_API_URL || "";

export function fishImageUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// cn versi tailwind-merge: menangani konflik kelas Tailwind (mis. bg-forest vs
// bg-ivory) dengan benar. Dipakai komponen gaya shadcn di panel admin.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

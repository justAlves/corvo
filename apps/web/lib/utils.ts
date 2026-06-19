import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const environment = {
  apiUrl: {
    development: "http://localhost:3333",
    production: "https://api.krewo.app",
  }
}

export const defaultEnvironment = environment.apiUrl.production;
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (str: string): string => {
  if (typeof str !== "string" || !str.trim()) return "?";

  return (
    str
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(word => word[0])
      .join("")
      .toUpperCase() || "?"
  );
};

export function formatCurrency(
  amount: number,
  opts?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    noDecimals?: boolean;
  }
) {
  const {
    currency = "USD",
    locale = "en-US",
    minimumFractionDigits,
    maximumFractionDigits,
    noDecimals,
  } = opts ?? {};

  const formatOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency,
    minimumFractionDigits: noDecimals ? 0 : minimumFractionDigits,
    maximumFractionDigits: noDecimals ? 0 : maximumFractionDigits,
  };

  return new Intl.NumberFormat(locale, formatOptions).format(amount);
}

/**
 * Get the base URL dynamically based on the environment
 * In production (Vercel), it uses NEXT_PUBLIC_VERCEL_URL
 * In development, it uses NEXT_PUBLIC_BASE_URL
 */
export function getBaseUrl(): string {
  // Production: use Vercel URL if available
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }

  // Fallback to NEXT_PUBLIC_BASE_URL
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

/**
 * Get the login URL dynamically based on the environment
 */
export function getLoginUrl(): string {
  // If explicitly set, use it
  if (process.env.NEXT_PUBLIC_LOGIN_URL) {
    return process.env.NEXT_PUBLIC_LOGIN_URL;
  }

  // Otherwise, construct it from base URL
  return `${getBaseUrl()}/auth/login`;
}

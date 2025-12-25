// ✅ EDGE-SAFE Configuration
// File ini hanya berisi konstanta, aman untuk middleware/edge runtime
export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";
export const localePrefix = "always" as const;

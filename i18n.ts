import { getRequestConfig } from "next-intl/server";

export const locales = ["id", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "id";
export const localePrefix = "as-needed" as const;

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = locales.includes(locale as Locale) ? (locale as Locale) : defaultLocale;
  const messages = (await import(`./src/messages/${resolvedLocale}.json`)).default;
  return {
    locale: resolvedLocale,
    messages,
  };
});

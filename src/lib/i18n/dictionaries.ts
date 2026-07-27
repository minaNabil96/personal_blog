import "server-only";

export type Locale = "ar" | "en" | "ru";
export const locales: Locale[] = ["ar", "en", "ru"];
export const defaultLocale: Locale = "ar";

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ru: () => import("./dictionaries/ru.json").then((m) => m.default),
} as const;

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}

export function hasLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}

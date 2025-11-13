const normalize = (locale: string) => locale.toLowerCase();

const getNavigatorLanguages = (): string[] => {
  if (typeof navigator === "undefined") {
    return [];
  }

  const userLanguage = (navigator as Navigator & { userLanguage?: string }).userLanguage;

  return [
    ...(navigator.languages ?? []),
    navigator.language,
    userLanguage,
  ].filter(Boolean) as string[];
};

export const detectLocale = (availableLocales: string[]): string | null => {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return null;
  }

  const normalized = availableLocales.map(normalize);
  const candidates = getNavigatorLanguages();

  for (const candidate of candidates) {
    const lowerCandidate = normalize(candidate);
    const exactIndex = normalized.indexOf(lowerCandidate);
    if (exactIndex >= 0) {
      return availableLocales[exactIndex];
    }

    const base = lowerCandidate.split("-")[0];
    const matchIndex = normalized.findIndex((locale) => locale === base);
    if (matchIndex >= 0) {
      return availableLocales[matchIndex];
    }
  }

  return null;
};

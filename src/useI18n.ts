import { useContext, useMemo } from "react";

import type { I18nContextValue } from "./I18nProvider";
import { useI18nContext } from "./I18nProvider";

export interface TranslateOptions {
  [placeholder: string]: unknown;
}

export type { I18nContextValue };

export const useI18n = () => {
  const context = useContext(useI18nContext());

  if (!context) {
    throw new Error("useI18n must be used within an <I18nProvider>");
  }

  return useMemo(() => ({
    t: context.t,
    setLocale: context.setLocale,
    locale: context.locale,
    availableLocales: context.availableLocales,
    isLoading: context.isLoading,
  }), [context]);
};

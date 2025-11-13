import { useContext, useMemo } from "react";

import { createLocaleFormatter } from "./utils/formatter";
import { useI18nContext } from "./I18nProvider";

export interface LocaleFormatter {
  formatDate: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string;
}

export const useLocaleFormatter = (): LocaleFormatter => {
  const context = useContext(useI18nContext());

  if (!context) {
    throw new Error("useLocaleFormatter must be used within an <I18nProvider>");
  }

  return useMemo(() => createLocaleFormatter(context.locale), [context.locale]);
};

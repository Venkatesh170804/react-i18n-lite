import type { LocaleFormatter } from "../useLocaleFormatter";

const ensureDate = (value: Date | number | string): Date => {
  if (value instanceof Date) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
};

export const createLocaleFormatter = (locale: string): LocaleFormatter => ({
  formatDate: (value, options) => new Intl.DateTimeFormat(locale, options).format(ensureDate(value)),
  formatNumber: (value, options) => new Intl.NumberFormat(locale, options).format(value),
  formatCurrency: (value, currency, options) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      ...options,
    }).format(value),
});

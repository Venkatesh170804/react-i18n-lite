import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";

import { I18nProvider } from "../src/I18nProvider";
import { useI18n } from "../src/useI18n";
import { useLocaleFormatter } from "../src/useLocaleFormatter";

const resources = {
  en: {
    label: "Number",
  },
  de: {
    label: "Zahl",
  },
};

describe("useLocaleFormatter", () => {
  it("formats values with the active locale", () => {
    const Consumer = () => {
      const { formatNumber, formatCurrency, formatDate } = useLocaleFormatter();
      const formattedNumber = formatNumber(1234567.89);
      const formattedCurrency = formatCurrency(5000, "USD");
      const formattedDate = formatDate(new Date("2025-11-13T12:00:00Z"), {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      });

      return (
        <div>
          <span data-testid="number">{formattedNumber}</span>
          <span data-testid="currency">{formattedCurrency}</span>
          <span data-testid="date">{formattedDate}</span>
        </div>
      );
    };

    render(
      <I18nProvider defaultLocale="en" resources={resources}>
        <Consumer />
      </I18nProvider>,
    );

    expect(screen.getByTestId("number").textContent).toBe("1,234,567.89");
    expect(screen.getByTestId("currency").textContent).toBe("$5,000.00");
    expect(screen.getByTestId("date").textContent).toBe("Nov 13, 2025");
  });

  it("updates formatting when locale changes", async () => {
    const Consumer = () => {
      const { setLocale } = useI18n();
      const { formatNumber } = useLocaleFormatter();

      useEffect(() => {
        void setLocale("de");
      }, [setLocale]);

      return <span data-testid="formatted">{formatNumber(1234.5)}</span>;
    };

    render(
      <I18nProvider defaultLocale="en" resources={resources}>
        <Consumer />
      </I18nProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("formatted").textContent).toBe("1.234,5");
    });
  });
});

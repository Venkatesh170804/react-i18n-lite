import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { I18nProvider } from "../src/I18nProvider";
import { useI18n } from "../src/useI18n";

const resources = {
  en: {
    welcome: "Welcome, {{name}}!",
    fallbackOnly: "Available only in English",
  },
  es: {
    welcome: "¡Bienvenido, {{name}}!",
  },
};

type TestWrapperProps = {
  children: ReactNode;
};

const Wrapper = ({ children }: TestWrapperProps) => (
  <I18nProvider defaultLocale="en" resources={resources}>
    {children}
  </I18nProvider>
);

describe("react-i18n-lite", () => {
  it("renders translation for default locale", () => {
    const Consumer = () => {
      const { t } = useI18n();
      return <p>{t("welcome", { name: "Venkatesh" })}</p>;
    };

    render(<Consumer />, { wrapper: Wrapper });

    expect(screen.getByText("Welcome, Venkatesh!")).toBeInTheDocument();
  });

  it("switches locale at runtime", async () => {
    const Consumer = () => {
      const { t, setLocale } = useI18n();

      return (
        <div>
          <p data-testid="message">{t("welcome", { name: "Alex" })}</p>
          <button onClick={() => setLocale("es")} type="button">
            Switch
          </button>
        </div>
      );
    };

    render(<Consumer />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("Switch"));

    await waitFor(() => {
      expect(screen.getByTestId("message")).toHaveTextContent("¡Bienvenido, Alex!");
    });
  });

  it("falls back to default locale when key missing", async () => {
    const Consumer = () => {
      const { t, setLocale } = useI18n();

      useEffect(() => {
        void setLocale("es");
      }, [setLocale]);

      return <span>{t("fallbackOnly")}</span>;
    };

    render(<Consumer />, { wrapper: Wrapper });

    await waitFor(() => {
      expect(screen.getByText("Available only in English")).toBeInTheDocument();
    });
  });

  it("loads missing locales with async loader", async () => {
    const loadLocale = jest.fn(async (locale: string) => {
      if (locale === "fr") {
        return {
          welcome: "Bienvenue, {{name}}!",
        };
      }
      throw new Error("Unexpected locale");
    });

    const AsyncWrapper = ({ children }: TestWrapperProps) => (
      <I18nProvider defaultLocale="en" resources={resources} loadLocale={loadLocale}>
        {children}
      </I18nProvider>
    );

    const Consumer = () => {
      const { t, setLocale } = useI18n();

      useEffect(() => {
        void setLocale("fr");
      }, [setLocale]);

      return <span>{t("welcome", { name: "Zara" })}</span>;
    };

    render(<Consumer />, { wrapper: AsyncWrapper });

    await waitFor(() => {
      expect(screen.getByText("Bienvenue, Zara!")).toBeInTheDocument();
    });
  });
});

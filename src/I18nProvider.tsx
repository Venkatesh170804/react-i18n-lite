import {
  createContext,
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { detectLocale as detectBrowserLocaleFn } from "./utils/detectLocale";
import { interpolate } from "./utils/interpolate";

export type Messages = Record<string, string>;
export type Resources = Record<string, Messages>;
export type LocaleLoader = (locale: string) => Promise<Messages>;

export interface I18nProviderProps {
  /** Locale used when detection fails or translations are missing. */
  defaultLocale: string;
  /** Map of locale identifiers to translation dictionaries. */
  resources?: Resources;
  /** Attempt to detect the user's language from the browser. Defaults to true. */
  detectBrowserLocale?: boolean;
  /** Optional async loader for lazily fetching locale messages. */
  loadLocale?: LocaleLoader;
  /** Invoked when a translation key cannot be found. */
  onMissingKey?: (info: { key: string; locale: string }) => void;
}

export interface I18nContextValue {
  locale: string;
  availableLocales: string[];
  isLoading: boolean;
  t: (key: string, options?: Record<string, unknown>) => string;
  setLocale: (locale: string) => Promise<void>;
}

const I18nContext = createContext<I18nContextValue | null>(null);
I18nContext.displayName = "I18nContext";

const isRecord = (value: unknown): value is Record<string, string> =>
  typeof value === "object" && value !== null;

export const I18nProvider = ({
  defaultLocale,
  resources = {},
  detectBrowserLocale = true,
  children,
  loadLocale,
  onMissingKey,
}: PropsWithChildren<I18nProviderProps>) => {
  const [messages, setMessages] = useState<Resources>(resources);
  const [locale, setLocaleState] = useState<string>(() => {
    const initialLocales = Object.keys(resources);
    const detected = detectBrowserLocale ? detectBrowserLocaleFn(initialLocales) : null;
    return detected ?? defaultLocale;
  });
  const [isLoading, setIsLoading] = useState(false);
  const defaultLocaleRef = useRef(defaultLocale);
  const pendingPromiseRef = useRef<Promise<void> | null>(null);

  const ensureLocaleMessages = useCallback(
    async (targetLocale: string): Promise<boolean> => {
      if (messages[targetLocale]) {
        return true;
      }

      if (!loadLocale) {
        return false;
      }

      setIsLoading(true);
      try {
        const loaded = await loadLocale(targetLocale);
        if (!isRecord(loaded)) {
          throw new Error("Loaded locale must return an object mapping keys to strings");
        }
        setMessages((prev) => ({ ...prev, [targetLocale]: loaded }));
        return true;
      } catch (error) {
        console.error(`[react-i18n-lite] Failed to load locale "${targetLocale}":`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [loadLocale, messages],
  );

  const setLocale = useCallback(
    async (nextLocale: string) => {
      if (nextLocale === locale) {
        return;
      }

      if (!(await ensureLocaleMessages(nextLocale))) {
        console.warn(
          `[react-i18n-lite] Locale "${nextLocale}" is unavailable. Falling back to "${locale}".`,
        );
        return;
      }

      setLocaleState(nextLocale);
    },
    [ensureLocaleMessages, locale],
  );

  useEffect(() => {
    if (messages[locale]) {
      return;
    }

    const run = async () => {
      pendingPromiseRef.current = ensureLocaleMessages(locale).then(() => {
        pendingPromiseRef.current = null;
      });

      await pendingPromiseRef.current;
    };

    run().catch((error) => {
      console.error(`[react-i18n-lite] Unable to initialise locale "${locale}":`, error);
    });
  }, [ensureLocaleMessages, locale, messages]);

  useEffect(() => {
    defaultLocaleRef.current = defaultLocale;
  }, [defaultLocale]);

  const availableLocales = useMemo(() => Object.keys(messages), [messages]);

  const translate = useCallback(
    (key: string, variables: Record<string, unknown> = {}) => {
      const activeMessages = messages[locale] ?? {};
      const fallbackMessages = messages[defaultLocaleRef.current] ?? {};

      const template = activeMessages[key] ?? fallbackMessages[key];
      if (!template) {
        onMissingKey?.({ key, locale });
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[react-i18n-lite] Missing translation for key "${key}" in locale "${locale}".`);
        }
        return key;
      }

      return interpolate(template, variables);
    },
    [locale, messages, onMissingKey],
  );

  const value = useMemo<I18nContextValue>(
    () => ({ locale, availableLocales, isLoading, setLocale, t: translate }),
    [availableLocales, isLoading, locale, setLocale, translate],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18nContext = () => I18nContext;

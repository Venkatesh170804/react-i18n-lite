# @venkateshmedipudi/react-i18n-lite

> Lightweight internationalisation (i18n) utilities for React applications with built-in locale detection, memoised translations, and locale-aware formatting.

## ✨ Features

- 🔤 Context-based translation provider with intuitive `useI18n()` hook
- 🌐 Automatic browser language detection with configurable fallback
- ⚙️ Optional async locale loader for code-splitting translation bundles
- 🧮 Locale-aware date, number, and currency helpers via `useLocaleFormatter()`
- 🧠 Helpful warnings for missing keys and full TypeScript typings
- 🚀 Ready-to-publish build with ESM + CJS outputs and Jest test suite

## 📦 Installation

```bash
npm install @venkateshmedipudi/react-i18n-lite
# or
yarn add @venkateshmedipudi/react-i18n-lite
# or
pnpm add @venkateshmedipudi/react-i18n-lite
```

Peer dependency: `react >= 18`. Install it separately if it is not already part of your project.

## 🚀 Quick Start

```tsx
import { I18nProvider, useI18n } from "@venkateshmedipudi/react-i18n-lite";

const resources = {
  en: { welcome: "Welcome, {{name}}!" },
  es: { welcome: "¡Bienvenido, {{name}}!" }
};

function Home() {
  const { t, setLocale } = useI18n();

  return (
    <div>
      <h1>{t("welcome", { name: "Venkatesh" })}</h1>
      <button onClick={() => setLocale("es")}>Switch to Spanish</button>
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider defaultLocale="en" resources={resources}>
      <Home />
    </I18nProvider>
  );
}
```

## 🛠 API Reference

### `<I18nProvider>`

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `defaultLocale` | `string` | — | Locale used when detection fails or no resource exists. |
| `resources` | `Record<string, Record<string, string>>` | `{}` | Translation dictionaries keyed by locale. |
| `detectBrowserLocale` | `boolean` | `true` | Use browser language if supported. |
| `loadLocale` | `(locale: string) => Promise<Record<string, string>>` | `undefined` | Lazy-load messages for locales not bundled initially. |
| `onMissingKey` | `({ key, locale }) => void` | `undefined` | Called when a translation key is not found. |

### `useI18n()`

Returns:

```ts
{
  t: (key: string, vars?: Record<string, unknown>) => string;
  setLocale: (locale: string) => Promise<void>;
  locale: string;
  availableLocales: string[];
  isLoading: boolean;
}
```

- `t` interpolates placeholders like `{{name}}`.
- `setLocale` triggers async loading when `loadLocale` is supplied.
- `availableLocales` reflects all loaded resource keys.

### `useLocaleFormatter()`

Locale-aware wrappers around the built-in `Intl` APIs using the active locale from `useI18n()`:

```ts
const { formatDate, formatNumber, formatCurrency } = useLocaleFormatter();

formatDate(new Date()); // e.g. "13 Nov 2025"
formatNumber(1234567.89); // e.g. "1,234,567.89"
formatCurrency(209537500, "INR"); // e.g. "₹2,09,53,750.00"
```

### Async Locale Loading

Pass a `loadLocale` function to lazy-load dictionaries:

```tsx
<I18nProvider
  defaultLocale="en"
  resources={{ en: baseMessages }}
  loadLocale={(locale) => import(`./locales/${locale}.json`).then((m) => m.default)}
>
  <App />
</I18nProvider>
```

When `setLocale("es")` is called, the loader resolves translations and caches them.

## 🧪 Testing

```bash
npm test
```

- **`tests/i18n.test.tsx`** — verifies translation rendering, locale switching, fallbacks, and async loading
- **`tests/formatter.test.ts`** — covers number/date/currency formatting and locale updates

## 🧱 Project Scripts

| Command | Description |
| --- | --- |
| `npm run build` | Builds ESM & CJS bundles with Vite + Rollup. |
| `npm run test` | Executes Jest + React Testing Library suite. |
| `npm run lint` | Runs TypeScript type-check with `tsc --noEmit`. |
| `npm run publish:package` | Convenience wrapper for `npm publish --access public`. |

## 🧑‍💻 Contributing

1. Fork the repository and clone your fork.
2. Install dependencies with `npm install`.
3. Run `npm run test` and `npm run lint` before submitting a PR.
4. Describe your changes in the PR template and link any relevant issues.

Issues and feature requests are welcome—feel free to open a discussion before large changes.

## 🔗 Example Project

A sample integration is available at: [https://github.com/venkateshmedipudi/react-i18n-lite-example](https://github.com/venkateshmedipudi/react-i18n-lite-example)

## 📄 License

Released under the [MIT License](./LICENSE).

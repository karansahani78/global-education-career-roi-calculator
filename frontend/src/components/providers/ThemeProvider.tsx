import { useEffect, type ComponentProps } from "react";
import { useTheme, ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Keeps the browser chrome in sync with the resolved theme. next-themes owns
 * the `.dark` class; this only updates the two mobile status-bar meta tags.
 */
const ThemeColorSync = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const dark = resolvedTheme === "dark";

    document
      .querySelector('meta[name="theme-color"]:not([media])')
      ?.setAttribute("content", dark ? "#0b0f19" : "#f7f7f4");
    document
      .querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
      ?.setAttribute("content", dark ? "black-translucent" : "default");
  }, [resolvedTheme]);

  return null;
};

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}

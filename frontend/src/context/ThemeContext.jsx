import { createContext, useContext, useEffect } from "react";
import { THEME } from "@/constants/app.constants";
import { useLocalStorage } from "@/hooks";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useLocalStorage("appearance", {
    theme: THEME.LIGHT,
    accent: THEME.ACCENT_COLOR,
    compact: false,
  });

  useEffect(() => {
    const root = document.documentElement;

    if (appearance.theme === THEME.DARK) {
      root.classList.add("dark");
    } else if (appearance.theme === THEME.LIGHT) {
      root.classList.remove("dark");
    } else {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      root.classList.toggle("dark", media.matches);
    }
  }, [appearance.theme]);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty("--accent", appearance.accent);

    const isDark = isColorDark(appearance.accent);
    root.style.setProperty(
      "--accent-foreground",
      isDark ? "#ffffff" : "#1a1a1a",
    );
  }, [appearance.accent]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("compact", appearance.compact);
  }, [appearance.compact]);

  return (
    <ThemeContext.Provider value={{ appearance, setAppearance }}>
      {children}
    </ThemeContext.Provider>
  );
}

function isColorDark(hex) {
  const c = hex.substring(1);
  const rgb = parseInt(c, 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance < 140;
}

export function useTheme() {
  return useContext(ThemeContext);
}

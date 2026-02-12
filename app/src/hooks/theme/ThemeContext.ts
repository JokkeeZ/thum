import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

interface IThemeContext {
  theme: Theme;
  updateTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<IThemeContext>({
  theme: "light",
  updateTheme: (theme: Theme) => {
    void theme;
  },
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeContext");
  }
  return context;
};

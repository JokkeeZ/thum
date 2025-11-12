import { createContext, useContext } from "react";

export interface IThemeContext {
  theme: string;
  updateTheme: (theme: string) => void;
};

export const ThemeContext = createContext<IThemeContext>({
  theme: "light",
  updateTheme: (theme: string) => { void theme; }
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error(
      "useTheme must be used within a ThemeContext"
    );
  }
  return context;
};

import type { IChartTheme } from "../types/IChartTheme";

export function getChartTheme(): IChartTheme {
  const styles = getComputedStyle(document.documentElement);

  return {
    temperature: styles.getPropertyValue("--temperature").trim(),
    temperatureBg: styles.getPropertyValue("--temperature-bg").trim(),
    fontSize: parseInt(styles.getPropertyValue("--chart-font-size").trim()),
    humidity: styles.getPropertyValue("--humidity").trim(),
    humidityBg: styles.getPropertyValue("--humidity-bg").trim(),
    foreground: styles.getPropertyValue("--chart-foreground").trim(),
    humidityHoverRadius: parseInt(
      styles.getPropertyValue("--humidity-hover-radius").trim(),
    ),
    temperatureHoverRadius: parseInt(
      styles.getPropertyValue("--temperature-hover-radius").trim(),
    ),
    grid: styles.getPropertyValue("--chart-grid").trim(),
  };
}

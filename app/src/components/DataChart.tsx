import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type TooltipItem,
  type ChartData,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { IDataChart } from "../types/IDataChart";
import SpinnyLoader from "./SpinnyLoader";
import { useMemo } from "react";
import { getChartTheme } from "../utils/chart-theme";
import CenteredSpinnyLoader from "./CenteredSpinnyLoader";

export default function DataChart(props: {
  chartData: IDataChart;
  chartReady: boolean;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
  );

  const chartTheme = useMemo(() => getChartTheme(), []);

  ChartJS.defaults.color = chartTheme.foreground;
  ChartJS.defaults.font.size = chartTheme.fontSize;

  const data: ChartData<"line", number[], string> = {
    labels: props.chartData.labels,
    datasets: [
      {
        label: "Temperature",
        data: props.chartData.temperatures,
        borderColor: chartTheme.temperature,
        backgroundColor: chartTheme.temperatureBg,
        tension: 0.25,
        pointHoverRadius: chartTheme.temperatureHoverRadius,
      },
      {
        label: "Humidity",
        data: props.chartData.humidities,
        borderColor: chartTheme.humidity,
        backgroundColor: chartTheme.humidityBg,
        tension: 0.25,
        pointHoverRadius: chartTheme.humidityHoverRadius,
      },
    ],
  };

  if (!props.chartReady) {
    return <CenteredSpinnyLoader />;
  }

  return (
    <div className="d-flex justify-content-center align-items-center col-md-12 min-vh-90">
      <div className="chart-container">
        <Line
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              intersect: false,
              mode: "index",
            },

            scales: {
              x: { grid: { color: chartTheme.grid } },
              y: { grid: { color: chartTheme.grid } },
            },

            plugins: {
              tooltip: {
                callbacks: {
                  footer(tooltipItems: TooltipItem<"line">[]) {
                    const temperature = tooltipItems.find(
                      (i) => i.dataset.label === "Temperature",
                    )?.parsed.y;
                    const humidity = tooltipItems.find(
                      (i) => i.dataset.label === "Humidity",
                    )?.parsed.y;

                    if (
                      Number.isFinite(temperature) &&
                      temperature &&
                      Number.isFinite(humidity) &&
                      humidity
                    ) {
                      const dewPoint = temperature - (100 - humidity) / 5;
                      return `Dew point: ${dewPoint.toFixed(2)}°C`;
                    }

                    return `Dew point: ?`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

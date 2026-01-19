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
import zoomPlugin from "chartjs-plugin-zoom";
import type { IDataChart } from "../types/IDataChart";
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
    zoomPlugin,
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

  const calculateDewPoint = (temperature: number, humidity: number) => {
    return temperature - (100 - humidity) / 5;
  };

  // https://fi.wikipedia.org/wiki/Kastepiste
  const getAirComfortLevel = (dewPoint: number) => {
    if (dewPoint < 10) {
      return "Dry";
    } else if (dewPoint >= 10 && dewPoint < 16) {
      return "Comfortable";
    } else if (dewPoint >= 16 && dewPoint < 18) {
      return "Humid";
    } else {
      return "Oppressive";
    }
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
              zoom: {
                pan: {
                  enabled: true,
                  modifierKey: "ctrl",
                  mode: "x",
                },
                zoom: {
                  drag: { enabled: true },
                  mode: "x",
                },
              },
              tooltip: {
                callbacks: {
                  footer(tooltipItems: TooltipItem<"line">[]) {
                    const temperature = tooltipItems.find(
                      (i) => i.dataset.label === "Temperature",
                    )?.parsed.y;
                    const humidity = tooltipItems.find(
                      (i) => i.dataset.label === "Humidity",
                    )?.parsed.y;

                    if (temperature && humidity) {
                      const dewPoint = calculateDewPoint(temperature, humidity);
                      return `Dew point: ${dewPoint.toFixed(2)}°C`;
                    }
                  },
                  afterFooter(tooltipItems: TooltipItem<"line">[]) {
                    const temperature = tooltipItems.find(
                      (i) => i.dataset.label === "Temperature",
                    )?.parsed.y;
                    const humidity = tooltipItems.find(
                      (i) => i.dataset.label === "Humidity",
                    )?.parsed.y;

                    if (temperature && humidity) {
                      const dewPoint = calculateDewPoint(temperature, humidity);
                      const airComfort = getAirComfortLevel(dewPoint);
                      return `The air may feel: ${airComfort}`;
                    }
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

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

export default function DataChart(props: {
  chartData: IDataChart;
  chartReady: boolean;
}) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
  );

  const chartFontSize = 14;
  const chartColor = "rgba(141, 141, 141, 1)";

  ChartJS.defaults.color = chartColor;
  ChartJS.defaults.font.size = chartFontSize;

  const data: ChartData<"line", number[], string> = {
    labels: props.chartData.labels,
    datasets: [
      {
        label: "Temperature",
        data: props.chartData.temperatures,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        tension: 0.25,
        pointHoverRadius: 8,
      },
      {
        label: "Humidity",
        data: props.chartData.humidities,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
        tension: 0.25,
        pointHoverRadius: 8,
      },
    ],
  };

  return (
    <div className="container-fluid mt-3">
      <div className="d-flex justify-content-center align-items-center col-md-12 min-vh-90">
        {props.chartReady ? (
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
                  x: { grid: { color: "rgba(141, 141, 141, 0.2)" } },
                  y: { grid: { color: "rgba(141, 141, 141, 0.2)" } },
                },

                plugins: {
                  tooltip: {
                    callbacks: {
                      footer(tooltipItems: TooltipItem<"line">[]) {
                        const tempItem = tooltipItems.find(i => i.dataset.label === "Temperature");
                        const humItem = tooltipItems.find(i => i.dataset.label === "Humidity");

                        const temperature = tempItem?.parsed.y;
                        const humidity = humItem?.parsed.y;

                        if (Number.isFinite(temperature) && temperature && Number.isFinite(humidity) && humidity) {
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
        ) : (
          <SpinnyLoader width={50} height={50} />
        )}
      </div>
    </div>
  );
}

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
import type { IDataChart } from "../types";

function DataChart(props: {
  chartData: IDataChart
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
    <>
      <div className="chart-container">
        <Line
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
                    const dewPoint =
                      tooltipItems[1].parsed.y -
                      (100 - tooltipItems[0].parsed.y) / 5;
                    return `Dew point: ${dewPoint.toFixed(2)}°C`;
                  },
                },
              },
            },
          }}
          data={data}
        />
      </div>
    </>
  );
}

export default DataChart;

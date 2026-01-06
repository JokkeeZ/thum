import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";

export default function Home() {
  const { errorNotification } = useNotification();
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  useEffect(() => {
    ApiService.all()
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((error) => {
        errorNotification("Failed to fetch data from API.");
        console.error(error);
      });
  }, [errorNotification]);

  return (
    <div className="container">
      <div className="col-md-6 mx-auto">
        <h3 className="text-primary-emphasis text-center mb-3 mt-3">
          All time averages
        </h3>
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </div>
  );
}

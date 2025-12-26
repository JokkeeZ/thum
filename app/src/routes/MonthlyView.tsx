import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import moment from "moment";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import MonthPicker from "../components/MonthPicker";
import ApiService from "../services/ApiService";

export default function MonthlyView() {
  const now = moment();
  const [year, setYear] = useState(now.year());
  const [month, setMonth] = useState(now.month() + 1);
  const { errorNotification } = useNotification();
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  useEffect(() => {
    ApiService.monthly(year, month)
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
  }, [year, month, errorNotification]);

  return (
    <>
      <div className="col-md-6 mx-auto">
        <MonthPicker setMonth={setMonth} setYear={setYear} />
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}

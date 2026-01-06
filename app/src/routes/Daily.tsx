import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import ApiService from "../services/ApiService";
import { DateTime } from "luxon";
import DateTimePicker from "../components/pickers/DateTimePicker";

export default function Daily() {
  const now = DateTime.now();
  const [date, setDate] = useState<DateTime<true>>(now);
  const [chartReady, setChartReady] = useState<boolean>(false);
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  const { errorNotification } = useNotification();

  useEffect(() => {
    ApiService.daily(date.day, date.month, date.year)
      .then((resp) => {
        setChartData({
          labels: resp.data.map((p) => p.ts),
          temperatures: resp.data.map((p) => p.temperature),
          humidities: resp.data.map((p) => p.humidity),
        });

        setChartReady(true);
      })
      .catch((err) => {
        errorNotification("Failed to fetch data from API.");
        console.error(err);
      });
  }, [date, errorNotification]);

  return (
    <div className="container">
      <DateTimePicker type="date" onDateSelected={(d) => setDate(d)} />
      <DataChart chartData={chartData} chartReady={chartReady} />
    </div>
  );
}

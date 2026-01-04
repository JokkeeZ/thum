import { useEffect, useState } from "react";
import { type IDataChart } from "../types/IDataChart";
import { useNotification } from "../components/notification/NotificationContext";
import DataChart from "../components/DataChart";
import DatePicker from "../components/DatePicker";
import ApiService from "../services/ApiService";
import { DateTime } from "luxon";

export default function DailyView() {
  const now = DateTime.now();
  const [date, setDate] = useState(now.toJSDate());
  const [chartReady, setChartReady] = useState<boolean>(false);
  const { errorNotification } = useNotification();
  const [chartData, setChartData] = useState<IDataChart>({
    humidities: [],
    labels: [],
    temperatures: [],
  });

  useEffect(() => {
    const dd = DateTime.fromJSDate(date);

    ApiService.daily(dd.day, dd.month, dd.year)
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
    <>
      <div className="col-md-6 mx-auto">
        <DatePicker setDate={setDate} />
      </div>

      <DataChart chartData={chartData} chartReady={chartReady} />
    </>
  );
}
